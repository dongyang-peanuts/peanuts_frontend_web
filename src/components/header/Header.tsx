import axios from "axios";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const adminId = sessionStorage.getItem("id");
  const navigate = useNavigate();

  const logOut = () => {
    axios
      .post(`/admin/logout/${adminId}`)
      .then((res) => {
        sessionStorage.removeItem("id");
        navigate("/");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div className="m-[0px] border-b bg-white">
      <div className="flex justify-between items-center max-w-[1116px] m-auto h-[56px]">
        <div>LOGO</div>
        <div className="flex items-center">
          <li className="text-sm font-semibold list-none text-[#6A9850] mr-[53px]">
            대시보드
          </li>
          <li onClick={logOut} className="text-sm font-semibold list-none">
            로그아웃
          </li>
        </div>
      </div>
    </div>
  );
};

export default Header;
