
const API = window.location.hostname === "localhost" ||
           window.location.hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : "https://helper-buddy.onrender.com";

// =====================================
// COMMON AUTH FUNCTIONS
// =====================================

function getSavedUser() {
    try {
        return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
        return null;
    }
}

function getToken() {
    return localStorage.getItem("token");
}

function saveLoginData(data) {
    if (!data || !data.token || !data.user) {
        throw new Error("Login token or user data missing.");
    }

    const user = {
        ...data.user,
        id: data.user.id || data.user._id
    };

    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(user));
}

function logoutUser() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "login.html";
}

// =====================================
// SEND REGISTRATION OTP
// =====================================

async function sendRegistrationOTP() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    if (!name || !email || !password || !role) {
        alert("Please fill all registration fields.");
        return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email)) {
        alert("Please enter a valid Gmail address.");
        return;
    }

    if (password.length < 8) {
        alert("Password must be at least 8 characters.");
        return;
    }

    const button = document.getElementById("sendOtpBtn");
    if (button) button.disabled = true;

    try {
        const response = await fetch(`${API}/api/auth/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role })
        });

        const data = await response.json();

        alert(data.message || "OTP request completed.");

        if (response.ok) {
            document.getElementById("otpSection").style.display = "block";
            document.getElementById("email").readOnly = true;
        }

    } catch (error) {
        console.error(error);
        alert("Server connection failed.");
    } finally {
        if (button) button.disabled = false;
    }
}

async function registerUser() {
    await sendRegistrationOTP();
}

// =====================================
// VERIFY REGISTRATION OTP
// =====================================

async function verifyRegistrationOTP() {
    const email = document.getElementById("email").value.trim().toLowerCase();
    const otp = document.getElementById("otp").value.trim();

    if (!/^\d{6}$/.test(otp)) {
        alert("Please enter a valid 6-digit OTP.");
        return;
    }

    const button = document.querySelector(
        "#otpSection button[onclick='verifyRegistrationOTP()']"
    );

    if (button) button.disabled = true;

    try {
        const response = await fetch(`${API}/api/auth/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "OTP verification failed.");
            return;
        }

        alert(data.message || "Account created successfully!");
        window.location.href = "login.html";

    } catch (error) {
        console.error(error);
        alert("Server connection failed.");
    } finally {
        if (button) button.disabled = false;
    }
}

// =====================================
// LOGIN USER
// =====================================

async function loginUser() {
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("Please enter email and password.");
        return;
    }

    try {
        const response = await fetch(`${API}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Login failed.");
            return;
        }

        saveLoginData(data);

        const user = getSavedUser();

        alert("Login successful!");

        if (user.role === "helper") {
            window.location.href = "helper-dashboard.html";
        } else {
            window.location.href = "customer-dashboard.html";
        }

    } catch (error) {
        console.error("Login error:", error);
        alert(error.message || "Server connection failed.");
    }
}

// =====================================
// HELPER PROFILE STATUS
// =====================================

window.helperProfileExists = false;

// =====================================
// LOAD HELPER DASHBOARD
// =====================================

async function loadHelperDashboard() {
    const user = getSavedUser();
    const token = getToken();

    if (!user || !token) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    if (user.role !== "helper") {
        window.location.href = "customer-dashboard.html";
        return;
    }

    const userId = user.id || user._id;

    if (!userId) {
        console.error("User ID missing:", user);
        alert("User ID is missing. Please login again.");
        logoutUser();
        return;
    }

    try {
        const response = await fetch(
            `${API}/api/helpers/user/${encodeURIComponent(userId)}`,
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            }
        );

        if (response.status === 404) {
            window.helperProfileExists = false;

            document.getElementById("dashboardHeading").innerText =
                "Create Your Helper Profile";

            document.getElementById("profileSubmitBtn").innerText =
                "Create Profile";

            return;
        }

        if (response.status === 401 || response.status === 403) {
            const errorData = await response.json().catch(() => ({}));

            console.error("Authentication error:", errorData);

            alert(errorData.message || "Your login session is invalid. Please login again.");
            logoutUser();
            return;
        }

        if (!response.ok) {
            throw new Error("Unable to load helper profile.");
        }

        const helper = await response.json();

        window.helperProfileExists = true;

        document.getElementById("helperName").value = helper.name || "";
        document.getElementById("profession").value = helper.profession || "";
        document.getElementById("city").value = helper.city || "";
        document.getElementById("phone").value = helper.phone || "";
        document.getElementById("experience").value = helper.experience || "";
        document.getElementById("description").value = helper.description || "";

        document.getElementById("dashboardHeading").innerText =
            "Edit Your Helper Profile";

        document.getElementById("profileSubmitBtn").innerText =
            "Save Changes";

    } catch (error) {
        console.error("Dashboard error:", error);
        alert(error.message || "Unable to load your profile.");
    }
}

// =====================================
// CREATE OR UPDATE HELPER PROFILE
// =====================================

async function createHelperProfile() {
    const user = getSavedUser();
    const token = getToken();

    if (!user || !token) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }

    const userId = user.id || user._id;

    const name = document.getElementById("helperName").value.trim();
    const profession = document.getElementById("profession").value.trim();
    const city = document.getElementById("city").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const experience = document.getElementById("experience").value.trim();
    const description = document.getElementById("description").value.trim();

    if (!name || !profession || !city || !phone || !experience) {
        alert("Please fill all required fields.");
        return;
    }

    const formData = new FormData();

    formData.append("name", name);
    formData.append("profession", profession);
    formData.append("city", city);
    formData.append("phone", phone);
    formData.append("experience", experience);
    formData.append("description", description);

    const photoInput = document.getElementById("photo");
    const photo = photoInput.files[0];

    if (photo) {
        formData.append("photo", photo);
    }

    if (!window.helperProfileExists && !photo) {
        alert("Please upload your profile photo.");
        return;
    }

    const url = window.helperProfileExists
        ? `${API}/api/helpers/user/${encodeURIComponent(userId)}`
        : `${API}/api/helpers/create`;

    const method = window.helperProfileExists ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method,
            headers: {
                "Authorization": `Bearer ${token}`
            },
            body: formData
        });

        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
            alert(data.message || "Please login again.");
            logoutUser();
            return;
        }

        if (!response.ok) {
            alert(data.message || "Something went wrong.");
            return;
        }

        alert(data.message || "Profile saved successfully!");

        window.helperProfileExists = true;

        document.getElementById("dashboardHeading").innerText =
            "Edit Your Helper Profile";

        document.getElementById("profileSubmitBtn").innerText =
            "Save Changes";

        photoInput.value = "";

    } catch (error) {
        console.error(error);
        alert("Server connection failed.");
    }
}

// =====================================
// SEARCH HELPERS
// =====================================

async function searchHelpers() {
    const profession = document.getElementById("searchProfession").value;
    const city = document.getElementById("searchCity").value;

    const url = `${API}/api/helpers/search?profession=${encodeURIComponent(profession)}&city=${encodeURIComponent(city)}`;

    try {
        const response = await fetch(url);
        const helpers = await response.json();

        const results = document.getElementById("results");
        results.innerHTML = "";

        if (!response.ok || !Array.isArray(helpers)) {
            results.innerHTML = "<h3>Unable to load helpers.</h3>";
            return;
        }

        if (helpers.length === 0) {
            results.innerHTML = "<h3>No helpers found</h3>";
            return;
        }

        helpers.forEach(helper => {
            results.innerHTML += `
                <div class="helper-card">
                    <img src="${API}/uploads/${encodeURIComponent(helper.photo || "")}"
                         class="helper-image" alt="Helper photo">

                    <h2>${helper.name}</h2>
                    <p>🔧 ${helper.profession}</p>
                    <p>📍 ${helper.city}</p>
                    <p>Experience: ${helper.experience}</p>

                    <a href="helper-profile.html?id=${encodeURIComponent(helper._id)}" class="btn">
                        View Profile
                    </a>
                </div>
            `;
        });

    } catch (error) {
        console.error(error);
        alert("Unable to search helpers.");
    }
}

// =====================================
// OPEN HELPER PROFILE
// =====================================

function openHelper(id) {
    window.location.href =
        "helper-profile.html?id=" + encodeURIComponent(id);
}

// =====================================
// LOAD PUBLIC HELPER PROFILE
// =====================================

async function loadHelperProfile() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const container = document.getElementById("profileContainer");

    if (!id) {
        container.innerHTML = "<h3>Helper ID is missing.</h3>";
        return;
    }

    try {
        const response = await fetch(
            `${API}/api/helpers/${encodeURIComponent(id)}`
        );

        const helper = await response.json();

        if (!response.ok) {
            container.innerHTML = "<h3>Helper not found.</h3>";
            return;
        }

        container.innerHTML = `
            <div class="profile-view-card">
                <div class="profile-photo-section">
                    <img src="${API}/uploads/${encodeURIComponent(helper.photo || "")}"
                         alt="Helper photo">

                    <h2>${helper.name}</h2>
                    <h3>${helper.profession}</h3>

                    <div class="verified">✔ Verified Helper</div>
                </div>

                <div class="profile-details-section">
                    <p><strong>📍 City:</strong> ${helper.city}</p>
                    <p><strong>📞 Phone:</strong> ${helper.phone}</p>
                    <p><strong>⭐ Experience:</strong> ${helper.experience} Years</p>

                    <div class="profile-description">
                        ${helper.description || ""}
                    </div>

                    <a class="contact-btn"
                       href="tel:${encodeURIComponent(helper.phone)}">
                        Call Helper
                    </a>
                </div>
            </div>
        `;

    } catch (error) {
        console.error(error);
        container.innerHTML = "<h3>Unable to load helper profile.</h3>";
    }
}

// =====================================
// AUTOMATIC PAGE LOADING
// =====================================

if (document.querySelector(".helper-dashboard-page")) {
    loadHelperDashboard();
}

if (document.getElementById("profileContainer")) {
    loadHelperProfile();
}

// =====================================
// FORGOT PASSWORD - SEND OTP
// =====================================

async function sendPasswordResetOTP() {
    const email = document.getElementById("email").value.trim().toLowerCase();
    const message = document.getElementById("message");

    if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/i.test(email)) {
        message.innerText = "Please enter a valid Gmail address.";
        return;
    }

    try {
        const response = await fetch(`${API}/api/auth/forgot-password/send-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        message.innerText = data.message || "OTP request completed.";

        if (response.ok) {
            document.getElementById("otpSection").style.display = "block";
            document.getElementById("email").readOnly = true;
        }

    } catch (error) {
        console.error("Send OTP error:", error);
        message.innerText = "Server connection failed.";
    }
}

// =====================================
// FORGOT PASSWORD - VERIFY OTP
// =====================================

async function verifyPasswordResetOTP() {
    const email = document.getElementById("email").value.trim().toLowerCase();
    const otp = document.getElementById("otp").value.trim();
    const message = document.getElementById("message");

    if (!/^\d{6}$/.test(otp)) {
        message.innerText = "Enter a valid 6-digit OTP.";
        return;
    }

    try {
        const response = await fetch(`${API}/api/auth/forgot-password/verify-otp`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, otp })
        });

        const data = await response.json();

        console.log("OTP Verify Response:", data);

        if (!response.ok) {
            message.innerText = data.message || "OTP verification failed.";
            return;
        }

        if (!data.resetToken) {
            message.innerText = "Reset token missing from server response.";
            return;
        }

        sessionStorage.setItem("resetEmail", email);
        sessionStorage.setItem("resetToken", data.resetToken);

        message.innerText = "OTP verified. Opening password reset page...";

        window.location.href = "reset-password.html";

    } catch (error) {
        console.error("Verify OTP error:", error);
        message.innerText = "Server connection failed.";
    }
}

// =====================================
// RESET PASSWORD
// =====================================

async function resetPassword() {
    const email = sessionStorage.getItem("resetEmail");
    const resetToken = sessionStorage.getItem("resetToken");

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;
    const message = document.getElementById("message");

    if (!email || !resetToken) {
        message.innerText = "Please verify your OTP again.";
        return;
    }

    if (newPassword.length < 8) {
        message.innerText = "Password must contain at least 8 characters.";
        return;
    }

    if (newPassword !== confirmPassword) {
        message.innerText = "Passwords do not match.";
        return;
    }

    try {
        const response = await fetch(`${API}/api/auth/forgot-password/reset`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, resetToken, newPassword })
        });

        const data = await response.json();

        message.innerText = data.message || "Password reset request completed.";

        if (response.ok) {
            sessionStorage.removeItem("resetEmail");
            sessionStorage.removeItem("resetToken");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        }

    } catch (error) {
        console.error("Reset password error:", error);
        message.innerText = "Server connection failed.";
    }
}
