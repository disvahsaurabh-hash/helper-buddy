// ===============================
// REGISTER USER
// ===============================

async function registerUser(){

    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;


    const response = await fetch(
        "https://helper-buddy.onrender.com/api/auth/register",
        {
            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                name,
                email,
                password,
                role
            })
        }
    );


    const data = await response.json();

    alert(data.message);

}





// ===============================
// LOGIN USER
// ===============================

async function loginUser(){

    const email = document.getElementById("email").value;

    const password = document.getElementById("password").value;


    const response = await fetch(
        "https://helper-buddy.onrender.com/api/auth/login",
        {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },

            body:JSON.stringify({
                email,
                password
            })

        }
    );


    const data = await response.json();



    if(data.token){


        localStorage.setItem(
            "token",
            data.token
        );


        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );


        alert("Login successful");


        if(data.user.role === "helper"){

            window.location.href="helper-dashboard.html";

        }
        else{

            window.location.href="customer-dashboard.html";

        }


    }
    else{

        alert(data.message);

    }

}







// ===============================
// CREATE HELPER PROFILE
// ===============================

async function createHelperProfile(){


    const user = JSON.parse(
        localStorage.getItem("user")
    );


    if(!user){

        alert("Please login first");
        return;

    }



    const formData = new FormData();



    formData.append(
        "userId",
        user.id
    );


    formData.append(
        "name",
        document.getElementById("helperName").value
    );


    formData.append(
        "profession",
        document.getElementById("profession").value
    );


    formData.append(
        "city",
        document.getElementById("city").value
    );


    formData.append(
        "phone",
        document.getElementById("phone").value
    );


    formData.append(
        "experience",
        document.getElementById("experience").value
    );


    formData.append(
        "description",
        document.getElementById("description").value
    );



    const photo =
    document.getElementById("photo").files[0];


    if(photo){

        formData.append(
            "photo",
            photo
        );

    }



    const response = await fetch(

        "https://helper-buddy.onrender.com/api/helpers/create",

        {
            method:"POST",

            body:formData
        }

    );



    const data = await response.json();



    alert(
        data.message
    );


}







// ===============================
// SEARCH HELPERS
// ===============================

async function searchHelpers(){


    const profession =
    document.getElementById("searchProfession").value;


    const city =
    document.getElementById("searchCity").value;



    const url =
    `https://helper-buddy.onrender.com/api/helpers/search?profession=${profession}&city=${city}`;



    const response =
    await fetch(url);



    const helpers =
    await response.json();



    const results =
    document.getElementById("results");



    results.innerHTML="";



    if(helpers.length === 0){


        results.innerHTML = `

        <h3>
        No helpers found
        </h3>

        `;

        return;

    }



helpers.forEach(helper=>{


results.innerHTML += `


<div class="helper-card">


<img

src="https://helper-buddy.onrender.com/uploads/${helper.photo}"

class="helper-image"


>


<h2>
${helper.name}
</h2>


<p>
🔧 ${helper.profession}
</p>


<p>
📍 ${helper.city}
</p>


<p>
Experience:
${helper.experience}
</p>


<a 
href="helper-profile.html?id=${helper._id}"
class="btn">

View Profile

</a>


</div>



        `;


    });


}







// ===============================
// OPEN HELPER PROFILE
// ===============================

function openHelper(id){


    window.location.href =
    "helper-profile.html?id=" + id;


}








// ===============================
// LOAD HELPER PROFILE
// ===============================

async function loadHelperProfile(){


    const params =
    new URLSearchParams(
        window.location.search
    );


    const id =
    params.get("id");



    const response =
    await fetch(

        "https://helper-buddy.onrender.com/api/helpers/" + id

    );



    const helper =
    await response.json();




   document.getElementById("profileContainer").innerHTML = `


<div class="profile-view-card">


<div class="profile-photo-section">


<img src="https://helper-buddy.onrender.com/uploads/${helper.photo}">


<h2>
${helper.name}
</h2>


<h3>
${helper.profession}
</h3>


<div class="verified">
✔ Verified Helper
</div>


</div>




<div class="profile-details-section">


<p>
<strong>📍 City:</strong>
${helper.city}
</p>


<p>
<strong>📞 Phone:</strong>
${helper.phone}
</p>


<p>
<strong>⭐ Experience:</strong>
${helper.experience} Years
</p>



<div class="profile-description">

${helper.description}

</div>



<a class="contact-btn"
href="tel:${helper.phone}">

Call Helper

</a>


</div>


</div>


`;
}




if(
document.getElementById("profileContainer")
){

    loadHelperProfile();

}