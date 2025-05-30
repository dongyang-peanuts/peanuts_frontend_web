import MainButton from "@/components/buttons/MainButton";
import Input from "@/components/input/Input";
import AdminInfo from "@/models/userInfo.model";

interface PropsType {
  navigate: (address: string) => void;
  data: AdminInfo;
  setData: React.Dispatch<React.SetStateAction<AdminInfo | undefined>>;
  pwc: boolean;
  setPwc: React.Dispatch<React.SetStateAction<boolean>>;
  register: () => void;
}

const RegisterView = ({
  navigate,
  data,
  setData,
  pwc,
  setPwc,
  register,
}: PropsType) => {
  return (
    <div className="flex justify-center mt-[150px] focus:border-none">
      <div className="w-[546px] h-[503px]">
        <p className="text-center text-[#6a9850] font-[700] text-[24px] mt-[0] mb-[44px]">
          회원가입
        </p>
        <div className="w-[546px] h-[3px] bg-[#6a9850]"></div>
        <div>
          <div className="text-[14px] text-[#707070] mt-[32px] mb-[8px]">
            아이디 <span className="text-[#ff0000]">*</span>
          </div>
          <Input
            width="546px"
            height="44px"
            placeholder="아이디를 입력해주세요."
            type="text"
            name="adminId"
            onChange={(e) => {
              setData({ ...data, [e.target.name]: e.target.value });
            }}
          />
          {/* <div className="text-[10px] mt-[6px] text-[#EA4335] h-[10px]">
            *이미 존재하는 아이디입니다.
          </div> */}
        </div>
        <div>
          <div className="text-[14px] text-[#707070] mt-[11px] mb-[8px]">
            비밀번호 <span className="text-[#ff0000]">*</span>
          </div>
          <Input
            width="546px"
            height="48px"
            placeholder="비밀번호를 입력해주세요."
            type="password"
            name="adminPwd"
            onChange={(e) => {
              setData({ ...data, [e.target.name]: e.target.value });
            }}
          />
          {/* <div className="text-[10px] mt-[6px] text-[#EA4335] h-[10px]">
            *비밀번호를 작성해주세요.
          </div> */}
        </div>
        <div>
          <div className="text-[14px] text-[#707070] mt-[11px] mb-[8px]">
            비밀번호 확인 <span className="text-[#ff0000]">*</span>
          </div>
          <Input
            width="546px"
            height="48px"
            placeholder="비밀번호를 한번 더 입력해주세요."
            type="password"
            name="pwc"
            onChange={(e) => {
              if (data.adminPwd !== e.target.value) {
                setPwc(false);
                console.log(e.target.value);
              } else if (data.adminPwd === e.target.value) {
                setPwc(true);
              }
            }}
          />
          <div className="text-[10px] mt-[6px] text-[#EA4335]  h-[10px]">
            {pwc ? null : "*비밀번호가 일치하지 않습니다."}
          </div>
        </div>
        <div className="mt-[34px] mb-[13px]">
          <MainButton
            width="546px"
            height="48px"
            backgroundColor="#6a9850"
            text="회원가입"
            color="white"
            borderColor="none"
            onClick={register}
          />
        </div>
        <p
          className="text-[16px] text-[#707070] mt-[24px]"
          style={{ display: "flex", justifyContent: "end" }}
          onClick={() => {
            navigate("/");
          }}
        >
          로그인하기
        </p>
      </div>
    </div>
  );
};

export default RegisterView;
