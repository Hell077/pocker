import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainPage from "../pages/MainPage/main.tsx";
import Lobby from "../components/LobbyContent/Lobby.tsx";
import Layout from "../components/Layout/Layout";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage />} />
                <Route path="/lobby" element={
                    <Layout>
                        <Lobby />
                    </Layout>
                } />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
