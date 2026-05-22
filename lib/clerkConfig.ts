/**
 * Clerk Configuration
 * Custom branding and localization for SwiftFingers
 */

export const clerkAppearance = {
  elements: {
    rootBox: "font-sans",
    card: "bg-zinc-950 border border-zinc-800 shadow-2xl",
    headerTitle: "text-white text-2xl font-bold",
    headerSubtitle: "text-zinc-400",
    socialButtonsBlockButton: "bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white transition-colors",
    socialButtonsBlockButtonText: "text-white font-medium",
    dividerLine: "bg-zinc-800",
    dividerText: "text-zinc-500",
    formFieldLabel: "text-zinc-300 font-medium",
    formFieldInput: "bg-zinc-900 border-zinc-800 text-white focus:border-primary-500 focus:ring-primary-500",
    formButtonPrimary: "bg-white text-black hover:bg-zinc-200 font-semibold transition-colors",
    footerActionLink: "text-primary-400 hover:text-primary-300 font-medium",
    identityPreviewText: "text-white",
    identityPreviewEditButton: "text-primary-400 hover:text-primary-300",
    formFieldInputShowPasswordButton: "text-zinc-400 hover:text-white",
    otpCodeFieldInput: "bg-zinc-900 border-zinc-800 text-white",
    formResendCodeLink: "text-primary-400 hover:text-primary-300",
    alertText: "text-zinc-300",
    formFieldSuccessText: "text-green-400",
    formFieldErrorText: "text-red-400",
    identityPreview: "bg-zinc-900 border-zinc-800",
    profileSectionTitleText: "text-white",
    profileSectionContent: "text-zinc-300",
    badge: "bg-primary-500/20 text-primary-400 border-primary-500/30",
    userButtonPopoverCard: "bg-zinc-950 border border-zinc-800",
    userButtonPopoverActionButton: "text-zinc-300 hover:text-white hover:bg-zinc-900",
    userButtonPopoverActionButtonText: "text-zinc-300",
    userButtonPopoverFooter: "hidden",
    // Profile page styling
    profilePage: "bg-zinc-950",
    profilePageTitle: "text-white",
    profilePageSubtitle: "text-zinc-400",
    // Avatar upload button styling
    avatarBox: "border-none",
    avatarImageActionsUpload: "bg-white text-black hover:bg-zinc-200 font-semibold",
    avatarImageActionsRemove: "bg-red-500 text-white hover:bg-red-600 font-semibold",
    avatarImageActions: "bg-zinc-900/90 backdrop-blur-sm",
    // Form buttons in profile
    formButtonReset: "bg-zinc-800 text-white hover:bg-zinc-700 border border-zinc-700",
    // Hide phone number field
    formFieldRow__phoneNumber: "hidden",
    phoneInputBox: "hidden",
  },
  variables: {
    colorPrimary: "#2dd4bf",
    colorText: "#ffffff",
    colorBackground: "#09090b",
    colorInputBackground: "#18181b",
    colorInputText: "#ffffff",
    colorDanger: "#ef4444",
    colorSuccess: "#22c55e",
    colorWarning: "#f59e0b",
    borderRadius: "0.75rem",
    fontFamily: "inherit",
  },
  layout: {
    socialButtonsPlacement: "top" as const,
    socialButtonsVariant: "blockButton" as const,
  }
};

// Custom localization to replace "Acme Co" with "SwiftFingers"
export const clerkLocalization = {
  signIn: {
    start: {
      title: "Sign in to SwiftFingers",
      subtitle: "Welcome back! Please sign in to continue",
    },
  },
  signUp: {
    start: {
      title: "Create your SwiftFingers account",
      subtitle: "Start improving your typing speed today",
    },
  },
};
