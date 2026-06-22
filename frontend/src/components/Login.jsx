import { useState } from "react";

export default function Login({ onLogin }) {

const [registerMode, setRegisterMode] = useState(false);

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [error, setError] = useState("");
const [message, setMessage] = useState("");

const handleLogin = async (e) => {


e.preventDefault();

setError("");
setMessage("");

try {

  const response = await fetch(
    "http://localhost:8000/auth/login",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    }
  );

  const data = await response.json();

  if (!data.access_token) {
    setError("Invalid credentials");
    return;
  }

  localStorage.setItem(
    "token",
    data.access_token
  );

  if (onLogin) {
    onLogin();
  }

} catch (err) {

  console.error(err);
  setError("Login failed");

}


};

const handleRegister = async (e) => {


e.preventDefault();

setError("");
setMessage("");

try {

  const response = await fetch(
    "http://localhost:8000/auth/register",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email,
        password
      })
    }
  );

  const data = await response.json();

  if (data.error) {
    setError(data.error);
    return;
  }

  setMessage(
    "Registration successful. Please log in."
  );

  setRegisterMode(false);

} catch (err) {

  console.error(err);
  setError("Registration failed");

}


};

return (
<div
style={{
display: "flex",
justifyContent: "center",
alignItems: "center",
height: "100vh"
}}
>
<form
onSubmit={
registerMode
? handleRegister
: handleLogin
}
style={{
display: "flex",
flexDirection: "column",
gap: "10px",
width: "300px"
}}
> <h2>
{registerMode
? "Register"
: "Login"} </h2>

    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) =>
        setEmail(e.target.value)
      }
    />

    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) =>
        setPassword(e.target.value)
      }
    />

    <button type="submit">
      {registerMode
        ? "Register"
        : "Login"}
    </button>

    <button
      type="button"
      onClick={() =>
        setRegisterMode(
          !registerMode
        )
      }
    >
      {registerMode
        ? "Back to Login"
        : "Create Account"}
    </button>

    {error && (
      <div
        style={{
          color: "red"
        }}
      >
        {error}
      </div>
    )}

    {message && (
      <div
        style={{
          color: "green"
        }}
      >
        {message}
      </div>
    )}
  </form>
</div>


);
}

