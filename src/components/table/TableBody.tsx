import UserInfo, { UserList } from "@/models/userInfo.model";
import { useNavigate } from "react-router-dom";

interface PropsType {
  data: UserList;
}

const TableBody = ({ data }: PropsType) => {
  const navigate = useNavigate();
  return (
    <tbody className="bg-white">
      <tr className="h-14 border border-[#d9d9d9] items-center text-base font-medium">
        <td className="pl-[25px]">
          <input type="checkbox" />
        </td>
        <td
          onClick={() => {
            navigate("/userinfo/detail");
          }}
          className="text-center text-[#707070]"
        >
          {data.userEmail}
        </td>
        <td
          onClick={() => {
            navigate("/userinfo/detail");
          }}
          className="text-center text-[#707070]"
        >
          {data.userAddr}
        </td>
        <td
          onClick={() => {
            navigate("/userinfo/detail");
          }}
          className="text-center text-[#707070]"
        >
          {data.proNum}
        </td>
        <td
          onClick={() => {
            navigate("/userinfo/detail");
          }}
          className="text-center text-[#707070]"
        >
          2024.04.01
          {/* {data.createdAt} */}
        </td>
      </tr>
    </tbody>
  );
};

export default TableBody;
