import { createRoot } from "react-dom/client";
import App from "./App";

const container = document.getElementById("si_interactiveContainer");
const root = createRoot(container);
root.render(<App />);
