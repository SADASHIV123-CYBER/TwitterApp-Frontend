const BACKEND = "https://twitterapp-backend-85c9.onrender.com";
const ENDPOINT = `${BACKEND}/api/v1/user`;

async function parseResponse(res) {
  let text = await res.text(); // read raw text
  let data = null;
  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { message: text || res.statusText };
  }

  if (!res.ok) {
    const error = new Error(data.message || "Request failed");
    error.response = { data, status: res.status };
    throw error;
  }

  return data;
}

export async function registerUser(form) {
  const hasFile =
    form.profilePicture &&
    typeof File !== "undefined" &&
    (form.profilePicture instanceof File || form.profilePicture instanceof Blob);

  if (hasFile) {
    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (!value) return; // skip null/empty
      if (key === "profilePicture") {
        fd.append(key, value, value.name || "file");
      } else {
        fd.append(key, String(value));
      }
    });

    const res = await fetch(ENDPOINT, {
      method: "POST",
      body: fd,
      credentials: "include",
    });

    const parsed = await parseResponse(res);
    return { data: parsed };
  } else {
    const payload = {};
    Object.entries(form).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        payload[key] = value;
      }
    });

    console.log("🚀 Register Payload:", payload);

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
