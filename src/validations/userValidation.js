import * as Yup from "yup";

export const UserSchema = Yup.object().shape({
  full_name: Yup.string()
    .required("Full Name is required")
    .min(2, "Full Name must be at least 2 characters"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  mobile_number: Yup.string()
    .matches(/^[0-9]{10,15}$/, "Enter a valid mobile number")
    .required("Mobile Number is required"),
  role: Yup.string().required("Role is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
  retypePassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Retype Password is required"),
});
