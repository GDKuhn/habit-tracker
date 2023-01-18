import "./styles/global.css";

import Habit from "./components/Habit";

function App() {
  return (
    <div className="App">
      <Habit completed={10} />
      <Habit completed={20} />
      <Habit completed={30} />
    </div>
  );
}

export default App;
