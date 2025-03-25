import { toast } from 'react-toastify'; 
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';

export const ShowCustomToast = (message, type = 'default', duration) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <FaCheckCircle className="text-green-500" style={{ fontSize: '30px' }} />;
      case 'error':
        return <FaExclamationCircle className="text-red-500" style={{ fontSize: '30px' }} />;
      case 'info':
        return <FaInfoCircle className="text-blue-500" style={{ fontSize: '30px' }} />;
      default:
        return null; 
    }
  };

  const customStyle = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #213C7C',
    color: '#213C7C',
    minHeight: '50px'
  };

  toast(
    <div className={`custom-toast custom-toast-${type} flex items-center`}>
      <span className="custom-toast-icon mr-2">
        {getIcon()}
      </span>
      <span className="custom-toast-message">{message}</span>
    </div>,
    {
      className: `toast-${type}`,
      bodyClassName: "toast-body",
      progressClassName: "toast-progress",
      style: customStyle ,
      autoClose: duration,
    }
  );
};
