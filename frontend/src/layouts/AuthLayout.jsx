import { Outlet } from "react-router-dom";

/**
 * AuthLayout — transparent shell.
 * The LoginPage, ForgotPasswordPage and ResetPasswordPage each own
 * their own full-screen layout, so this wrapper just renders its child.
 */
export const AuthLayout = () => <Outlet />;
