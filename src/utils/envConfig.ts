import dotenv from "dotenv";
import { cleanEnv, str, num, email, url } from "envalid";

dotenv.config();

export const env = cleanEnv(process.env, {
  BASE_URL: url({ default: "https://sweldomo.com" }),
  EMAIL_INPUT: str({ default: "form#regForm input[type: 'email']" }),
  PASSWORD_INPUT: str({ default: "form#regForm input[type: 'password']" }),
  IAGREE: str({ default: "form#regForm input#iagree" }),
  LOG_IN_BUTTON: str({ default: "form#regForm button[type: 'submit']" }),
  OPEN_FACE_DTR: str({ default: "a#open_facedtr" }),
  TIME_MODAL_TRIGGER: str({ default: "button#verify" }),
  TIME_MODAL: str({ default: ".swal-modal" }),
  TIME_IN_BUTTON: str({ default: ".swal-modal button.swal-button.swal-button--login.btn-log.btn-login" }),
  TIME_OUT_BUTTON: str({ default: ".swal-modal button.swal-button.swal-button--logout.btn-log.btn-logout" }),
  CAPTURE_BUTTON: str({ default: "button#buttonCapture.verify.btn.btn-size.btn-block.capture.btn-primary" }),
  TIME_IN: str(),
  TIME_OUT: str(),
  LATITUDE: num(),
  LONGITUDE: num(),
  EMAIL: email(),
  PASSWORD: str(),
})