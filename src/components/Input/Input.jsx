function Input({
  label,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  required = false,
  className = "",
  ...props
}) {
  return (
    <div className="flex flex-col">
      {label && <label className="mb-1 font-medium text-gray-700">{label}</label>}
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        className={`w-full border rounded p-2 focus:ring-1 focus:ring-sky-500 ${className}`}
        {...props}
      />
    </div>
  );
}

export default Input;
