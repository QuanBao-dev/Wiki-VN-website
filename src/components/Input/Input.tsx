import "./Input.css";
interface Props {
  label: string;
  type:string;
  inputRef?: React.LegacyRef<HTMLInputElement> | undefined;
}
const Input = ({ label, inputRef, type }: Props) => {
  return (
    <div className="input-container">
      <input required ref={inputRef} type={type} />
      <div>
        <label>{label}</label>
        <div className="border-line"></div>
      </div>
    </div>
  );
};

export default Input;
