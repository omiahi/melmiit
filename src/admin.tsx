import React from "react";
import { createRoot } from "react-dom/client";
import Admin from "./backup_old_ui/Admin";
import "./admin.css";

const root = document.getElementById("root")!;
createRoot(root).render(<Admin />);
