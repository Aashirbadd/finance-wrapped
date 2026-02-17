import { useState } from "react";
import Sidebar from "./components/Sidebar";

function App() {
  const [count, setCount] = useState(0);

  return (
  /* The Red Border is the Parent. It MUST be flex. */
  <div className="flex w-screen min-h-screen border-4 border-red-500"> 
    
    {/* The Blue Border is your Sidebar */}
    <div className="border-4 border-blue-500 shrink-0">
      <Sidebar />
    </div>

    {/* The Green Border is your Main content */}
    <main className="flex-1 border-4 border-green-500">
      <div className="p-8">
        <h1 className="font-bold">Finance Visualizer</h1>
        <button onClick={() => setCount((count) => count + 1)}>
          Count is {count}
        </button>
      </div>
    </main>
  </div>
);

}

export default App;
