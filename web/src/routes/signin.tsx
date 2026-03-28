import { SignUpForm } from "../components/SignUpForm";
import { createFileRoute } from "@tanstack/react-router";

// might exclude this 

export const Route = createFileRoute("/signin")({
    component: SignUpForm,
});