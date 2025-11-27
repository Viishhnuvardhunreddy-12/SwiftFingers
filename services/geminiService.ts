
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EvaluationResult, MistakeAnalysis, DifficultyMode } from "../types";

// Helper to analyze character-level mistakes locally to guide the AI
const getCharacterErrorSummary = (original: string, typed: string): string => {
  const errorCounts: Record<string, number> = {};
  const len = Math.min(original.length, typed.length);

  for (let i = 0; i < len; i++) {
    const expected = original[i];
    const actual = typed[i];
    
    // Ignore space errors for character analysis to focus on letters
    if (expected !== actual && expected !== ' ' && actual !== ' ') {
      const key = `'${actual}' instead of '${expected}'`;
      errorCounts[key] = (errorCounts[key] || 0) + 1;
    }
  }
  
  // Sort by frequency
  const sorted = Object.entries(errorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5) // Top 5 distinct errors
    .map(([k, v]) => `${k} (${v} times)`);

  return sorted.length > 0 ? sorted.join(", ") : "No consistent character-level errors found.";
};

// New: Calculate quantitative metrics locally for speed
const calculateLocalStats = (original: string, typed: string, timeTaken: number) => {
  const originalWords = original.trim().split(/\s+/);
  const typedWords = typed.trim().split(/\s+/);
  
  let correctChars = 0;
  const mistypedWords: string[] = [];
  const missedWords: string[] = [];
  const extraWords: string[] = [];
  
  // Basic linear comparison
  // We align based on index. This is simple and fast.
  const len = Math.max(originalWords.length, typedWords.length);
  
  for (let i = 0; i < len; i++) {
    const orig = originalWords[i];
    const user = typedWords[i];
    
    if (orig && user) {
        if (orig === user) {
            correctChars += orig.length + 1; // +1 for the space (simplified logic)
        } else {
            mistypedWords.push(`${user} (vs ${orig})`);
        }
    } else if (orig && !user) {
        missedWords.push(orig);
    } else if (!orig && user) {
        extraWords.push(user);
    }
  }

  // WPM Calculation
  // Standard Formula: (All typed characters / 5) / (Time in minutes)
  const grossWPM = Math.round((typed.length / 5) / (timeTaken / 60));
  // Net WPM usually subtracts uncorrected errors. We'll use a simplified penalty.
  const netWPM = Math.max(0, grossWPM - mistypedWords.length); 
  
  // Accuracy
  // (Total Typed Words - Errors) / Total Typed Words
  const totalTypedWords = typedWords.length;
  // Prevent divide by zero
  const accuracy = totalTypedWords > 0 
    ? Math.max(0, Math.round(((totalTypedWords - mistypedWords.length) / totalTypedWords) * 100))
    : 0;

  // Score (0-100)
  // Weighted: 60% Accuracy, 40% Speed (capped at 100 WPM for score purposes)
  const speedScore = Math.min(netWPM, 100);
  const score = Math.round((accuracy * 0.6) + (speedScore * 0.4));

  return {
    wpm: isNaN(netWPM) ? 0 : netWPM,
    accuracy: isNaN(accuracy) ? 0 : accuracy,
    score: isNaN(score) ? 0 : score,
    mistyped_words: mistypedWords,
    missed_words: missedWords,
    extra_words: extraWords,
    errors: mistypedWords // Mapping for interface compatibility
  };
};

export const generatePracticeText = async (difficulty: DifficultyMode = 'INTERMEDIATE'): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let promptConfig = "";
    
    switch (difficulty) {
      case 'BEGINNER':
        promptConfig = "Generate a simple, easy-to-type 30-50 word English paragraph. Use simple vocabulary (top 500 common words). Keep sentences short and clear. Avoid complex punctuation like semicolons or dashes. Topic: Daily life or nature.";
        break;
      case 'HARD':
        promptConfig = "Generate a challenging 80-100 word English paragraph. High difficulty. Use sophisticated vocabulary, complex sentence structures, and varied punctuation. Topic: Science, philosophy, or literature.";
        break;
      case 'INTERMEDIATE':
      default:
        promptConfig = "Generate a random 60-80 word English paragraph. The difficulty should be medium. Avoid excessive punctuation or dialogue. Use commonly used real-world words. The text should flow naturally and be educational or interesting.";
        break;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${promptConfig} Return ONLY the raw text, no markdown formatting.`,
    });

    return response.text?.trim() || "Failed to generate text. Please try again.";
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
};

export const generateFloodText = async (difficulty: DifficultyMode = 'INTERMEDIATE'): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let promptConfig = "";

    // For Flood Escape, the time limit is fixed at 60s.
    // Adjusted lengths to be slightly shorter to make 60s achievable.
    switch (difficulty) {
      case 'BEGINNER':
        promptConfig = "Generate a short, simple suspenseful sentence (20-25 words). Topic: Escaping a rising river. Use simple verbs. No complex punctuation.";
        break;
      case 'HARD':
        promptConfig = "Generate a complex, high-stakes survival paragraph (45-55 words). Topic: Escaping a catastrophic facility flood. Use advanced vocabulary and urgency.";
        break;
      case 'INTERMEDIATE':
      default:
        promptConfig = "Generate a suspenseful, action-oriented single paragraph between 25-40 words. The theme must be about escaping a flood, rising water, survival, or a high-stakes escape. Use evocative verbs.";
        break;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${promptConfig} Return ONLY the raw text, no markdown formatting.`,
    });

    return response.text?.trim() || "The water is rising fast. You need to find higher ground immediately before the levees break.";
  } catch (error) {
    console.error("Error generating flood text:", error);
    throw error;
  }
};

export const generateBombText = async (difficulty: DifficultyMode = 'INTERMEDIATE'): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let promptConfig = "";
    
    switch (difficulty) {
      case 'BEGINNER':
        promptConfig = "Generate 10-12 simple 'defusal codes'. These should be short uppercase words (e.g. CUT, WIRE, BLUE, RED). Space separated.";
        break;
      case 'HARD':
        promptConfig = "Generate 15-20 complex 'defusal codes'. Mix alphanumeric strings and symbols (e.g. A7-X9, PROTOCOL_Z, 0098). Space separated.";
        break;
      case 'INTERMEDIATE':
      default:
        promptConfig = "Generate 12-15 medium 'defusal codes'. Use uppercase tactical words (e.g. DETONATE, ALPHA, SEQUENCE, TERMINAL). Space separated.";
        break;
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${promptConfig} Return ONLY the raw text (space separated words), no markdown formatting, no lists.`,
    });

    return response.text?.trim() || "CUT THE BLUE WIRE NOW SEQUENCE ALPHA";
  } catch (error) {
    console.error("Error generating bomb text:", error);
    throw error;
  }
};

export const generateShooterWords = async (difficulty: DifficultyMode = 'INTERMEDIATE'): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    let promptConfig = "Generate a list of 50 English words for a typing game. The list must strictly follow this distribution: 60% short words (1-5 letters), 25% medium words (6-9 letters), 15% long words (10-14 letters).";
    
    if (difficulty === 'HARD') {
      promptConfig += " Use complex, scientific, or literary vocabulary.";
    } else if (difficulty === 'BEGINNER') {
      promptConfig += " Use simple, common daily vocabulary.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${promptConfig} Return ONLY a space-separated string of words. Do not use bullets or numbers.`,
    });

    // We can just return space-separated words, the game engine will split them
    return response.text?.trim() || "space galaxy asteroid comet meteor planet orbit nebula star cluster universe gravity physics launch rocket shuttle mission control module station satellite cosmos vacuum alien martian lunar crater horizon zenith eclipse solar system milky way supernova black hole light year parsec quasar pulsar neutron plasma photon spectrum telescope observatory constellation zodiac magnitude azimuth";
  } catch (error) {
    console.error("Error generating shooter words:", error);
    // Fallback list
    return "alpha bravo charlie delta echo foxtrot golf hotel india juliett kilo lima mike november oscar papa quebec romeo sierra tango uniform victor whiskey xray yankee zulu shield laser beam plasma cannon thruster engine hyper drive warp speed command center pilot squadron fleet admiral general soldier combat tactic strategy defense offense invasion sector galaxy nebula star dust asteroid field comet trail orbit gravity well black hole singularity event horizon photon torpedo missile rocket launch pad countdown ignition lift off stage separation orbit insertion payload deploy solar panel antenna signal radio frequency wavelength spectrum bandwidth data stream uplink downlink";
  }
};

export const generateRacingWords = async (difficulty: DifficultyMode = 'INTERMEDIATE'): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Racing needs LOTS of words because they come in pairs and disappear fast
    let promptConfig = "Generate a list of 80 distinct English words for a racing typing game. Mix of short (3-5 letters) and medium (6-8 letters) words. Words should be action-oriented or cars/racing themed if possible.";
    
    if (difficulty === 'HARD') {
      promptConfig += " Include some longer mechanical terms (transmission, horsepower).";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `${promptConfig} Return ONLY a space-separated string of words. Do not use bullets or numbers.`,
    });

    return response.text?.trim() || "turbo speed drift race gear shift clutch brake steer wheel tire road track lane fast nitro boost engine motor fuel pump oil slick skid crash burn rubber asphalt tarmac curve turn apex line lap start finish flag signal light green red yellow danger zone safe pass overtake win lose champion trophy podium medal gold silver bronze driver pilot navigator crew pit stop mechanic tool jack wrench bolt nut screw piston valve cylinder exhaust pipe muffler bumper fender hood door glass window seat belt helmet suit glove boot pedal throttle meter gauge speedometer tachometer odometer fuel gauge temp heat cool fan radiator hose belt chain drive shaft axle suspension spring shock absorber strut bar chassis frame body paint decal sticker sponsor logo brand team club member fan crowd cheer stadium arena circuit rally cross kart formula indy nascar touring drag street outlaw underground illegal police siren chase escape evade capture arrest fine ticket jail prison freedom liberty justice law order rule regulation limit speed trap camera radar laser gun shoot fire weapon armor shield health life death respawn restart retry quit exit menu option setting config control input key mouse keyboard gamepad joystick steering wheel pedal shifter handbrake clutch paddle button switch toggle slider knob dial lever handle grip hold release press push pull turn twist spin rotate flip roll pitch yaw surge sway heave bob weave dodge duck jump hop skip slide glide fly soar dive climb fall drop crash boom bang pow zap zoom whoosh swoosh roar rumble grumble growl hiss sputter cough choke stall die kill murder destroy wreck smash bash crash crush crumble tumble stumble trip fall slip slide skid drift spin donut burnout launch start stop go slow fast quick rapid swift instant sudden abrupt sharp tight wide narrow long short big small huge tiny micro macro mega giga tera peta exa zetta yotta";
  } catch (error) {
    console.error("Error generating racing words:", error);
    return "drift race car speed turbo nitro gear fast lane road track turn win lose shift brake steer wheel tire motor engine fuel oil gas pedal clutch drive ride move go stop red green light flag start finish lap time record best top pro ace king hero legend myth god mode skill rank level xp point score coin cash money prize reward gift bonus loot drop item part upgrade tune mod fix repair kit tool box jack lift tire slick rain wet dry hot cold ice snow mud dirt sand dust smoke fog mist haze dark night day sun moon star sky blue red green yellow orange purple pink black white gray silver gold bronze metal steel iron carbon fiber plastic rubber glass leather wood cloth fabric vinyl nylon polyester cotton wool silk linen velvet satin denim canvas mesh net grid wire cable cord rope chain string thread line tape glue paste gum wax polish shine clean wash soap water foam bubble sponge brush cloth rag towel wipe dry blow air wind fan cool heat warm hot burn fire flame spark electric shock volt amp watt power energy force torque horse speed velocity acceleration momentum inertia mass weight gravity friction drag lift down force grip traction slip slide skid drift spin yaw pitch roll sway surge heave bob weave bounce shake rattle vibrate hum buzz beep honk siren horn alarm alert warning danger caution safe secure lock key code password login user admin root system hack crack break fix patch update upgrade install load save open close exit quit end game over";
  }
};

export const evaluateSession = async (
  originalText: string,
  userTypedText: string,
  timeInSeconds: number
): Promise<EvaluationResult> => {
  
  // 1. Calculate Statistics Locally (Instant)
  const stats = calculateLocalStats(originalText, userTypedText, timeInSeconds);
  const charSummary = getCharacterErrorSummary(originalText, userTypedText);

  // 2. Fetch AI Insights (Feedback Only)
  // We don't ask AI to count words anymore, reducing latency by ~70%
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        feedback_summary: { type: Type.STRING },
        improvement_suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: [
        "feedback_summary",
        "improvement_suggestions"
      ],
    };

    const prompt = `
      Analyze this typing session based on the provided stats.
      
      Stats:
      - WPM: ${stats.wpm}
      - Accuracy: ${stats.accuracy}%
      - Most Frequent Character Errors: ${charSummary}
      - Mistyped Words List: ${JSON.stringify(stats.mistyped_words.slice(0, 10))}

      Task:
      1. Provide a "feedback_summary" (2-3 lines). Be encouraging but honest.
      2. Provide 5 "improvement_suggestions". Include specific advice on the character errors mentioned above if any.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (!response.text) {
        throw new Error("No response from Gemini");
    }

    const aiResult = JSON.parse(response.text);

    // 3. Merge Local Stats with AI Feedback
    return {
      generated_text: originalText,
      ...stats,
      feedback_summary: aiResult.feedback_summary,
      improvement_suggestions: aiResult.improvement_suggestions
    };

  } catch (error) {
    console.error("Error analyzing qualitative feedback:", error);
    // Fallback: If AI fails, we still return the valid calculated stats!
    return {
      generated_text: originalText,
      ...stats,
      feedback_summary: "Great effort! We calculated your stats locally, but our AI coach is momentarily unavailable to give detailed text feedback.",
      improvement_suggestions: [
        "Focus on accuracy over speed",
        "Maintain a consistent rhythm",
        "Take a break if your hands are tired",
        "Watch out for double letters",
        "Practice daily for best results"
      ]
    };
  }
};

export const analyzeMistakes = async (
  originalText: string,
  userTypedText: string,
  mistypedWords: string[],
  missedWords: string[],
  accuracy: number
): Promise<MistakeAnalysis> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const charSummary = getCharacterErrorSummary(originalText, userTypedText);

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        correction_paragraph: { type: Type.STRING },
        micro_drills: { type: Type.ARRAY, items: { type: Type.STRING } },
        pattern_explanation: { type: Type.STRING },
        improvement_goal: { type: Type.STRING },
      },
      required: [
        "correction_paragraph",
        "micro_drills",
        "pattern_explanation",
        "improvement_goal"
      ],
    };

    const prompt = `
      Analyze this user's typing session to generate a personalized practice plan.
      
      Context:
      - Original Text: "${originalText}"
      - User Typed: "${userTypedText}"
      - Mistyped Words: ${JSON.stringify(mistypedWords)}
      - Missed Words: ${JSON.stringify(missedWords)}
      - Accuracy: ${accuracy}%
      - **Specific Character Substitution Errors:** ${charSummary}

      Tasks:
      1. Create a "correction_paragraph" (20-40 words). It must be a coherent, natural English sentence or two. heavily incorporating the mistyped words and words with similar letter patterns/bigrams. Do NOT just list the words.
      2. Create 3 "micro_drills". These are short, repetitive character patterns based on the errors.
         CRITICAL: If the "Specific Character Substitution Errors" shows a pattern (e.g. 'a' instead of 'e'), create drills for that key pair (e.g. "ea ea ae ae").
      3. Provide a "pattern_explanation" (1-2 sentences) explaining what specific weakness was detected, specifically referencing the character errors if present.
      4. Set a one-line "improvement_goal" for the next session.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    if (!response.text) {
      throw new Error("No response from Gemini for mistake analysis");
    }

    return JSON.parse(response.text) as MistakeAnalysis;

  } catch (error) {
    console.error("Error analyzing mistakes:", error);
    // Return a safe fallback to keep the UI functional
    return {
      correction_paragraph: "Practice makes perfect. Focus on accuracy before speed in this session.",
      micro_drills: ["the the the", "ing ing ing", "tion tion tion"],
      pattern_explanation: "We couldn't generate specific insights this time, but consistency is key.",
      improvement_goal: "Maintain a steady rhythm."
    };
  }
};
