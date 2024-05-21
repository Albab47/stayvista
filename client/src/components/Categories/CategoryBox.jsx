/* eslint-disable no-unused-vars */
import PropTypes from "prop-types";
import queryStr from "query-string";
import { useNavigate, useSearchParams } from "react-router-dom";

const CategoryBox = ({ label, icon: Icon }) => {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const category = params.get("category");

  const handleClick = () => {
    // Create query string
    const currentQuery = { category: label };
    const url = queryStr.stringifyUrl({
      url: "/",
      query: currentQuery,
    });
    // Set query to url
    navigate(url);
  };

  return (
    <div
      onClick={handleClick}
      className={`flex
  flex-col 
  items-center 
  justify-center 
  gap-2
  p-3
  border-b-2
  hover:text-neutral-800
  transition
  cursor-pointer ${
    label === category && "border-b-neutral-800 text-neutral-800 transition-all duration-500"
  }`}
    >
      <Icon size={26} />
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
};

CategoryBox.propTypes = {
  label: PropTypes.string,
  icon: PropTypes.elementType,
};

export default CategoryBox;
