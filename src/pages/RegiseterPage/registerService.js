// src/services/registerService.js
const BACKEND = "https://twitterapp-backend-85c9.onrender.com";
const ENDPOINT = `${BACKEND}/api/v1/user`;

/**
 * Invert of your server->client mapping so we send server keys
 * when posting form data / json.
 */
const serverToClientFieldMap = {
  username: "userName",
  user_name: "userName",
  full_name: "fullName",
  fullname: "fullName",
  email: "email",
  password: "password",
  mobile: "mobileNumber",
  mobileNumber: "mobileNumber",
  displayName: "displayName",
  profilePicture: "profilePicture",
  role: "role",
};

// build client->server map by inverting. If duplicates, prefer first seen.
const clientToServerFieldMap = Object.entries(serverToClientFieldMap).reduce(
  (acc, [serverKey, clientKey]) => {
    if (!acc[clientKey]) acc[clientKey] = serverKey;
    return acc;
  },
  {}
);

/**
 * Helper to map client key to server key (fallback to same key).
 */
function mapClientToServer(key) {
  return clientToServerFieldMap[key] || key;
}

/**
 * Parse fetch response, and throw an error shaped like axios error so
 * existing catch(err) { err.response?.data } continues to work.
 */
async function parseResponse(res) {
  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = { message: res.statusText || "No response body" };
  }

  if (!res.ok) {
    const error = new Error(data.message || "Request failed");
    error.response = { data, status: res.status };
    throw error;
  }

  return data;
}

/**
 * registerUser(form)
 * - accepts the same `form` object you currently have in Register.jsx
 * - if profilePicture exists (File), sends multipart/form-data
 * - otherwise sends application/json
 * - uses `credentials: 'include'` to match withCredentials behavior
 * - returns an axios-like object: { data: <parsedResponse> } so existing code works
 */
export async function registerUser(form) {
  // detect if profilePicture is a File (or Blob)
  const hasFile =
    form.profilePicture &&
    typeof File !== "undefined" &&
    (form.profilePicture instanceof File || form.profilePicture instanceof Blob);

  if (hasFile) {
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      const serverKey = mapClientToServer(key);

      if (key === "profilePicture") {
        // append file; browser will set proper headers and boundary
        fd.append(serverKey, value, value.name || "file");
      } else {
        fd.append(serverKey, String(value));
      }
    });

    const res = await fetch(ENDPOINT, {
      method: "POST",
      body: fd,
      credentials: "include", // send cookies (like withCredentials)
      // DO NOT set Content-Type here for FormData
    });

    const parsed = await parseResponse(res);
    return { data: parsed };
  } else {
    // JSON payload (exclude profilePicture if null)
    const payload = {};
    Object.entries(form).forEach(([key, value]) => {
      if (value === null || value === undefined) return;
      if (key === "profilePicture") return;
      const serverKey = mapClientToServer(key);
      payload[serverKey] = value;
    });

    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const parsed = await parseResponse(res);
    return { data: parsed };
  }
}

export default registerUser;
