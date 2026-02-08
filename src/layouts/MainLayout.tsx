import { Outlet } from "react-router-dom";
// O CSS Global é importado AQUI para garantir que só seja carregado
// quando o usuário estiver no Dashboard ou em outras rotas,
// e NÃO na Landing Page otimizada /v5-3-5.
import "../index.css";

const MainLayout = () => {
    return (
        <div className="main-layout-wrapper">
            <Outlet />
        </div>
    );
};

export default MainLayout;
