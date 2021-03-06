// logout
function logOut() {
	localStorage.clear();
	// localStorage.removeItem("ut");
	window.location.reload();
}

function disableAddCartAndBuyButton(id) {
	// disable buy button when already bought current course
	let courseId
	if (typeof id == "string") {
		courseId = parseInt(id, 10);
	} else {
		courseId = id;
	}
	let courseList = JSON.parse(localStorage.getItem("courseBought"));
	let alreadyBought = false;
	alreadyBought = courseList.includes(courseId);
	if (alreadyBought) {
		/*document.getElementById("buyOneBtn").setAttribute("disabled", true);
		document.getElementById("addCartBtn").setAttribute("disabled", true);*/
		disableButton("buyOneBtn");
		disableButton("addCartBtn");
	}
}

function disableButton(btnId) {
	document.getElementById(btnId).setAttribute("disabled", true);
}

function disableButtonInList(btnId) {
	document.getElementById(btnId).classList.remove("btn", "btn-danger");
	document.getElementById(btnId).classList.add("btn-dark");
	document.getElementById(btnId).setAttribute("disabled", true);
}

function disableCartPurchase() {
	document.getElementById("selectedCourses").innerHTML = `
    	   <a class="dropdown-item disable-links" href="#">No Course To Purchase</a>
    	`
	document.getElementById("purchaseCoursesBtn").classList.add("disable-links");
	document.getElementById("clearCoursesBtn").classList.add("disable-links");
}

// get list of course bought
function getCourseBoughtList(token) {
	axios({
		url: 'http://localhost:8082/api/course/purchase/bought',
		method: 'get',
		headers: {
			Authorization: 'Bearer ' + token
		}
	}).then(res => {
		localStorage.setItem("courseBought", JSON.stringify(res.data));
	}).catch(err => {
		console.log(err);
	})
}

// register
function register() {
	let name = document.getElementById("rgName").value;
	let email = document.getElementById('rgEmail').value;
	let phone = document.getElementById('rgPhone').value;
	let password = document.getElementById('rgPassword').value;
	let confirmPassword = document.getElementById('rgConfirm').value;

	if (password !== confirmPassword) {
		alert("Passwords do not match!");
		return;
	}

	let user = {
		fullname: name,
		email: email,
		phone: phone,
		password: password,
		roleId: 3
	}

	axios({
		url: 'http://localhost:8082/api/auth',
		method: 'POST',
		data: user
	}).then(() => {
		alert("Registered successfully!");
		document.getElementById('rgName').value = '';
		document.getElementById('rgEmail').value = '';
		document.getElementById('rgPhone').value = '';
		document.getElementById('rgPassword').value = '';
		document.getElementById('rgConfirm').value = '';

		let logInUser = {
			email: email,
			password: password
		}

		axios({
			url: 'http://localhost:8082/api/auth/login',
			method: 'POST',
			data: logInUser
		})
			.then(res => {
				let token = res.data;

				localStorage.setItem("ut", token);
				window.location.reload();
			})
			.catch(err => {
				console.log(err);
			})

	}).catch(err => {
		console.log(err);
		alert("Registration failed!")
	})
}

// login
function logIn() {
	let email = document.getElementById("lgEmail").value;
	let password = document.getElementById("lgPassword").value;
	let logInUser = {
		email: email,
		password: password
	}

	axios({
		url: 'http://localhost:8082/api/auth/login',
		method: 'POST',
		data: logInUser
	})
		.then(res => {
			let token = res.data;
			localStorage.setItem("ut", token);
			document.getElementById("lgPassword").value = "";
			document.getElementById("lgEmail").value = "";
			alert("Signed in successfully!");
			window.location = window.location;
		})
		.catch(err => {
			console.log(err);
			alert("Login failed!")
		})
}

// show video frame popup
function showFrame(url, title) {
	document.getElementById("videoTitle").innerHTML = title;
	document.getElementById("videoFrame").setAttribute("src", url.replace("watch?v=", "embed/"));
}

// buy all courses in cart
function buyAll(token) {
	if (token == null) $("#loginModal").modal('show');
	else {
		let selectedCourses = JSON.parse(localStorage.getItem("courseInCart"));
		let courseToBuy = {
			cartList: selectedCourses
		}
		axios({
			url: 'http://localhost:8082/api/course/purchase',
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + token,
			},
			data: courseToBuy
		}).then(res => {
			clearCart();
			getCourseBoughtList(token);
			/*let courseList = JSON.parse(localStorage.getItem("courseBought"));
			selectedCourses.forEach(courseItem => {
				courseList.push(courseItem);
			})
			localStorage.setItem("courseBought", JSON.stringify(courseList));*/
			// disableAddCartAndBuyButton(id);
		}).catch(err => {
			console.log(err);
		})
	}
}

// buy current course function
async function buyOne(token, id) {
	// when click on Buy Now button, will show modal if without login token
	if (token == null) {
		$("#loginModal").modal('show');
	} else {
		let courseToBuy = {
			cartList: [id]
		};
		axios({
			url: 'http://localhost:8082/api/course/purchase',
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + token,
			},
			data: courseToBuy
		}).then(res => {
			clearCart();
			getCourseBoughtList(token)
			/*let courseList = JSON.parse(localStorage.getItem("courseBought"));
			courseList.push(id);
			localStorage.setItem("courseBought", JSON.stringify(courseList));*/
			// disableAddCartAndBuyButton(id);
		}).catch(err => {
			console.log(err);
		})
	}
}

// clear cart, remove localStorage
function clearCart() {
	localStorage.removeItem("courseInCart");
	document.getElementById("cartCount").innerHTML = 0;
	disableCartPurchase();
	/*document.getElementById("selectedCourses").innerHTML = `
    	   <a class="dropdown-item disable-links" href="#">No Course To Purchase</a>
    	`
	document.getElementById("purchaseCoursesBtn").classList.add("disable-links");
	document.getElementById("clearCoursesBtn").classList.add("disable-links");*/


	// window.location.reload();
}

// add cart function, add courseId into courses selected
function addCart(value) {
	let idAdded = parseInt(value, 10);
	// check cart count
	let courseInCart = JSON.parse(localStorage.getItem("courseInCart"));
	if (courseInCart == null) {
		courseInCart = [];
	}

	courseInCart.push(idAdded);

	// deduplicate item
	courseInCart = [...new Set(courseInCart)];
	document.getElementById("cartCount").innerHTML = courseInCart.length;
	document.getElementById("purchaseCoursesBtn").classList.remove("disable-links");
	document.getElementById("clearCoursesBtn").classList.remove("disable-links");

	showCartList(courseInCart);
	/*// show cart list
	axios({
		url: 'http://localhost:8082/api/course/cart',
		method: 'POST',
		data: {
			cartList: courseInCart
		}
	}).then(res => {
		console.log("This is show cart list scope");
		console.log(res.data)
		let selectedCourses = document.getElementById("selectedCourses");
		let htmlSelectedCoursesSub = "";
		let cartList = res.data;
		cartList.forEach(cart => {
			htmlSelectedCoursesSub += `
          <li><a class="dropdown-item" href="#">${cart.title}</a></li>
        `
		})
		selectedCourses.innerHTML = `
    	  <ol id="selectedCoursesSub">` + htmlSelectedCoursesSub + `</ol>
    	`;
	}).catch(err => {
		console.log(err);
	})*/

	localStorage.setItem("courseInCart", JSON.stringify(courseInCart));
}

// show cart list
function showCartList(courseIdList) {
	axios({
		url: 'http://localhost:8082/api/course/cart',
		method: 'POST',
		data: {
			cartList: courseIdList
		}
	}).then(res => {
		let selectedCourses = document.getElementById("selectedCourses");
		let htmlSelectedCoursesSub = "";
		let cartList = res.data;
		cartList.forEach(cart => {
			htmlSelectedCoursesSub += `
          <li><a class="dropdown-item" href="#">${cart.title}</a></li>
        `
		})
		selectedCourses.innerHTML = `
    	  <ol id="selectedCoursesSub">` + htmlSelectedCoursesSub + `</ol>
    	`;
	}).catch(err => {
		console.log(err);
	})
}

// load course detail
function courseDetail(id) {
	localStorage.setItem("courseId", id);
}

// fetch course details
function getCourseDetails(id) {
	axios({
		url: 'http://localhost:8082/api/course/detail/' + id,
		method: 'GET',
	}).then(res => {
		localStorage.setItem("courseDetails", JSON.stringify(res.data));
		// courseDetails = JSON.parse(localStorage.getItem("courseDetails"));
		let course = res.data;

		// courseBought = JSON.parse(localStorage.getItem("courseBought"));

		document.getElementById("courseTitle").innerHTML = course.title;
		document.getElementById("courseContent").innerHTML = course.content;
		document.getElementById("hourCount").innerHTML = course.hourCount;
		document.getElementById("lectureCount").innerHTML = course.lectureCount;
		document.getElementById("lectureCount2").innerHTML = course.lectureCount + " lectures";
		document.getElementById("lectureCount3").innerHTML = course.lectureCount;
		document.getElementById("lectureCount4").innerHTML = course.lectureCount;
		document.getElementById("categoryTitle").innerHTML = course.categoryTitle;
		document.getElementById("descriptionContent").innerHTML = course.description;
		document.getElementById("price").innerHTML = course.price + "$";
		document.getElementById("addCartBtn").setAttribute("value", course.id);
		document.getElementById("buyOneBtn").setAttribute("value", course.id);

		/*if (token) {
			// getCourseBoughtList(token, course);
			// disableAddCartAndBuyButton(course);
		}*/

		// fetch target list
		axios({
			url: `http://localhost:8082/api/target/${id}`,
			method: 'GET'
		}).then(targetRes => {
			let targetList = targetRes.data;
			let divTargetList = document.getElementById("targetList");
			let htmlTargetList = ""
			targetList.forEach(item => {
				htmlTargetList += `
      	  <div class="col-md-6">
            <ul class="course-desc-items">
              <li>
                <i class="fa fa-check"></i>
                <span>${item.title}</span>
              </li>
            </ul>
          </div>
      	`
			})
			divTargetList.innerHTML = htmlTargetList
		}).catch(targetErr => {
			console.log(targetErr);
		})

		// fetch video list
		axios({
			url: `http://localhost:8082/api/video/${id}`,
			method: 'GET'
		}).then(videoRes => {
			let timeHour = 0
			let timeMinute = 0
			let timeSecond = 0
			let totalMinute = 0
			let videoList = videoRes.data;
			let htmlVideoList = ""
			let divVideoList = document.getElementById("list-content");
			videoList.forEach(video => {
				totalMinute += video.timeCount;
				htmlVideoList += `
          <li>
            <a href="#" class="btn-video" onclick="showFrame('${video.url}', '${video.title}')"
            data-toggle="modal" data-target="#videoModal" >
                                    <span> <i class="fa fa-play-circle mr-1"></i>
                                        ${video.title}
                                    </span>
              <span>${video.timeCount} mins</span>
            </a>
          </li>
        `;
			})
			timeHour = parseInt((totalMinute / 60).toString());
			timeMinute = totalMinute % 60;
			if (timeHour < 10) {
				document.getElementById("timeHour").innerHTML = "0" + timeHour;
			} else {
				document.getElementById("timeHour").innerHTML = timeHour;
			}
			if (timeMinute < 10) {
				document.getElementById("timeMinute").innerHTML = "0" + timeMinute;
			} else {
				document.getElementById("timeMinute").innerHTML = timeMinute;
			}
			if (timeSecond < 10) {
				document.getElementById("timeSecond").innerHTML = "0" + timeSecond;
			} else {
				document.getElementById("timeSecond").innerHTML = timeSecond;
			}
			document.getElementById("timeHour2").innerHTML = timeHour;
			divVideoList.innerHTML = htmlVideoList;
		}).catch(videoErr => {
			console.log(videoErr);
		})

		// fetch cart list
		/*if (courseInCart.length === 0) {
			disableCartPurchase();
			/!*document.getElementById("selectedCourses").innerHTML = `
    	   <a class="dropdown-item disable-links" href="#">No Course To Purchase</a>
    	`
			document.getElementById("purchaseCoursesBtn").classList.add("disable-links");
			document.getElementById("clearCoursesBtn").classList.add("disable-links");*!/
		} else {
			axios({
				url: 'http://localhost:8082/api/course/cart',
				method: 'POST',
				data: {
					cartList: courseInCart
				}
			}).then(res => {
				let selectedCourses = document.getElementById("selectedCoursesSub");
				let htmlSelectedCourses = "";
				let cartList = res.data;
				cartList.forEach(cart => {
					htmlSelectedCourses += `
          <li><a class="dropdown-item" href="#">${cart.title}</a></li>
        `
				})
				selectedCourses.innerHTML = htmlSelectedCourses;
			}).catch(err => {
				console.log(err);
			})
		}*/

	}).catch(err => {
		console.log(err);
	})
}

// get user profile
function getUserProfile(token) {
	// load user profile info
	if (token) {
		axios({
			url: 'http://localhost:8082/api/user',
			method: 'GET',
			headers: {
				Authorization: 'Bearer ' + token
			}
		}).then(res => {
			// userProfile = res.data;
			localStorage.setItem("userProfile", JSON.stringify(res.data));
			document.getElementById("rightMenuTitle").innerHTML = res.data.fullname;
		}).catch(err => {
			console.log(err);
			localStorage.removeItem("ut");
			window.location.reload();
		})
	}
}

<!--Make Dropdown Menu Item-->
function drawMainMenuItem() {
	axios({
		url: 'http://localhost:8082/api/category',
		method: 'GET'
	}).then(res => {
		let categories = res.data;
		let htmlMenu = "";

		categories.forEach(item => {
			htmlMenu += `<a class="dropdown-item" href="#" id="categoryItem_${item.id}" onclick="listCoursesByCategory('${item.id}', '${item.title}')">
                            <i class="${item.icon} mr-1"></i>
                            <span class="text-capitalize">${item.title}</span>
                        </a>`
		})

		let divMenu = document.getElementById("dropdownMenuId");
		divMenu.innerHTML = htmlMenu;
	}).catch(err => {
		console.log(err);
	})
}


// show profile menu
function showProfileMenu(token, id) {
	let rightMenuHtml = "";

	if (token) {
		rightMenuHtml = `
      <div class="dropdown">
        <div class="dropdown-toggle font-weight-bold text-dark btn" data-toggle="dropdown" id="rightMenuTitle">
        </div>
        <div class="dropdown-menu dropdown-menu-right">
          <a class="dropdown-item" href="profile.html">Thông tin cá nhân</a>
          <a class="dropdown-item" href="course.html">Khóa học của tôi</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="#" onclick="logOut()">Đăng xuất</a>
        </div>
      </div>
  	`;
		document.getElementById("rightMenu").innerHTML = rightMenuHtml;
		document.getElementById("rightMenu").classList.add("d-flex", "justify-content-end");
		document.getElementById("rightMenu").classList.remove("text-right");

		getCourseDetails(id)
	}

}

function showProfileMenuWithoutCourseId(token) {
	let rightMenuHtml = "";

	if (token) {
		rightMenuHtml = `
      <div class="dropdown">
        <div class="dropdown-toggle font-weight-bold text-dark btn" data-toggle="dropdown" id="rightMenuTitle">
        </div>
        <div class="dropdown-menu dropdown-menu-right">
          <a class="dropdown-item" href="profile.html">Thông tin cá nhân</a>
          <a class="dropdown-item" href="course.html">Khóa học của tôi</a>
          <div class="dropdown-divider"></div>
          <a class="dropdown-item" href="#" onclick="logOut()">Đăng xuất</a>
        </div>
      </div>
  	`;
		document.getElementById("rightMenu").innerHTML = rightMenuHtml;
		document.getElementById("rightMenu").classList.add("d-flex", "justify-content-end");
		document.getElementById("rightMenu").classList.remove("text-right");
	}

}

function showPageFooter() {
	let pageFooter = document.getElementById("page-footer")
	pageFooter.innerHTML = `
        <span>© 2020 TTLECOM, INC.</span>
    `
}

function showProfileInfo(profile) {
	document.getElementById("userEmail").innerHTML = profile.email;
}

// show my course list
function showMyCourses(token) {
	axios({
		url: 'http://localhost:8082/api/user/course',
		method: 'get',
		headers: {
			Authorization: 'Bearer ' + token,
		}
	}).then(res => {
		let courseList = res.data;
		let htmlCourses = "";

		if (courseList.length > 0) {
			courseList.forEach(courseItem => {
				htmlCourses += `
  		  <div class="col-md-3">
          <a href="details.html" class="my-course-item" onclick="courseDetail(${courseItem.id})">
            <img src="${courseItem.image}" alt="${courseItem.title}">
            <h6 class="my-course-title">${courseItem.title}</h6>
            <div class="my-course-desc">
              ${courseItem.description}
            </div>
            <div class="my-course-author">
              <h6>
                <small>Lê Trung Tín</small>
                <small>Start course</small>
              </h6>
            </div>
          </a>
        </div>
  		`
			})
		} else {
			htmlCourses += `
				<h2>You don't have any courses!</h2>
			`
		}


		let divCourseList = document.getElementById("my-course-list")
		divCourseList.innerHTML = htmlCourses;
	}).catch(err => {
		console.log(err);
	})
}

// load profile info
function showProfileDetails(token) {
	axios({
		url: 'http://localhost:8082/api/user',
		method: 'GET',
		headers: {
			Authorization: 'Bearer ' + token
		}
	}).then(res => {
		userProfile = res.data;
		document.getElementById("bnEmail").innerHTML = userProfile.email;
		document.getElementById("bnFullname").innerHTML = userProfile.fullname;
		document.getElementById("rightMenuTitle").innerHTML = userProfile.fullname;

		document.getElementById("scEmail").value = userProfile.email;
		document.getElementById("fmEmail").value = userProfile.email;
		document.getElementById("fmFullname").value = userProfile.fullname;
		document.getElementById("fmPhone").value = userProfile.phone;
	}).catch(err => {
		console.log(err);
	})
}

// update profile info
function updateUserProfile(token) {
	let email = document.getElementById("fmEmail").value;
	let fullname = document.getElementById("fmFullname").value;
	let phone = document.getElementById("fmPhone").value;

	let newUserProfile = {
		email: email,
		fullname: fullname,
		phone: phone
	}

	if (token !== null) {
		axios({
			url: 'http://localhost:8082/api/user',
			method: 'PUT',
			headers: {
				Authorization: "Bearer " + token
			},
			data: newUserProfile
		}).then(() => {
			alert("Updated the user profile successfully!");
			document.getElementById("fmEmail").value = email;
			document.getElementById("fmFullname").value = fullname;
			document.getElementById("fmPhone").value = phone;

			localStorage.setItem("userProfile", JSON.stringify(newUserProfile));
			window.location.reload();
		}).catch(err => {
			console.log(err);
		})
	}
}

// Load user image
function loadUserImage(token) {
	let defaultImgUrl = "https://i.udemycdn.com/user/200_H/anonymous_3.png";
	let imgUrl = null;
	axios({
		url: 'http://localhost:8082/api/user/avatar',
		method: 'GET',
		headers: {
			Authorization: 'Bearer ' + token
		}
	}).then(res => {
		if (res.data.startsWith("http") || res.data.startsWith("https")) {
			imgUrl = res.data;
		} else {
			imgUrl = defaultImgUrl;
		}
		document.getElementById("avatarImg").setAttribute("src", imgUrl);
	}).catch(err => {
		console.log(err);
	})
}

// Upload image
function uploadImage(token) {
	let uploadImageButton = document.getElementById("uploadImageButton");
	let imgUrl = null;
	uploadImageButton.addEventListener("change", event => {
		let imgFile = event.target.files[0];
		let formData = new FormData();
		formData.append("file", imgFile);

		axios({
			url: 'http://localhost:8082/api/file/upload',
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + token
			},
			data: formData
		}).then(res => {
			imgUrl = 'http://localhost:8082' + res.data;
			document.getElementById("avatarImg").setAttribute("src", imgUrl);
			localStorage.setItem("avatarUrl", JSON.stringify(imgUrl));
		}).catch(err => {
			console.log(err);
		})
	})
}


function saveAvatar(token, profile) {
	let avatarUrl = JSON.parse(localStorage.getItem("avatarUrl"));
	let avatar = {
		email: profile.email,
		url: avatarUrl
	}
	axios({
		url: 'http://localhost:8082/api/user/avatar',
		method: 'PUT',
		headers: {
			Authorization: 'Bearer ' + token
		},
		data: avatar
	}).then(res => {
		alert("Changed the avatar successfully!")
		/*
		document.getElementById("uploadImageButton").value = res.data;
		let uploadImageButtonInput = document.getElementById("uploadImageButton").value;
		*/
	}).catch(err => {
		console.log(err);
	})
}

function changePassword(token, profile) {
	let currentPassword = document.getElementById("currentPassword").value;
	let newPassword = document.getElementById("newPassword").value;
	let confirmNewPassword = document.getElementById("confirmNewPassword").value;

	if (currentPassword === "") {
		alert("Please input the current password!")
		return;
	}

	if (newPassword === "") {
		alert("Please input a new password!");
		return;
	}

	if (newPassword !== confirmNewPassword) {
		alert("New passwords do not match!");
		return;
	}

	// check password matched
	axios({
		url: 'http://localhost:8082/api/user/password',
		method: 'POST',
		headers: {
			Authorization: "Bearer " + token
		},
		data: {
			currentPassword: currentPassword
		}
	}).then(res => {
		if (res.data === false) {
			alert("The current password is not correct! Please input the password again.")
			return;
		}
		axios({
			url: 'http://localhost:8082/api/user/password',
			method: 'PUT',
			headers: {
				Authorization: "Bearer " + token
			},
			data: {
				email: profile.email,
				password: newPassword
			}
		}).then(res => {
			alert(res.data);
			document.getElementById("currentPassword").value = "";
			document.getElementById("newPassword").value = "";
			document.getElementById("confirmNewPassword").value = "";
		}).catch(err => {
			console.log(err)
		})
	}).catch(err => {
		console.log(err);
	})
}

<!--Make Popular Categories-->
function showPopularCategories(num) {
	axios({
		url: 'http://localhost:8082/api/category',
		method: 'GET'
	}).then(res => {
		let categories = res.data;
		let htmlPopularCategory = "";

		categories.slice(0, num).forEach(item => {
			htmlPopularCategory += `
        <div class="col-md-3">
          <a class="category" id="popularCategory_${item.id}" onclick="listCoursesByCategory('${item.id}', '${item.title}')">
            <i class="${item.icon}"></i>
            <span class="text-capitalize">${item.title}</span>
          </a>
        </div>
    	`
		})

		let popularCategory = document.getElementById("popularCategory");

		popularCategory.innerHTML = htmlPopularCategory;
	}).catch(err => {
		console.log(err);
	})
}

function listCoursesByCategory(categoryId, categoryTitle) {
	localStorage.setItem("categoryId", categoryId);
	localStorage.setItem("categoryTitle", categoryTitle);
	window.location.href = "category.html";
}

// make html for course list
function htmlCourseList(courses, num, courseBought) {
	let htmlCourses = "";
	if (courseBought != null) {
		if (num == null) {
			courses.forEach(item => {
				htmlCourses += `
        <div class="col-md-2">
          <div class="course">
            <img src="${item.image}"/>
            <h6 class="course-title">${item.title}</h6>
            <small class="course-content">
              ${item.content}
            </small>
            <div class="course-price">
              <span>${item.price}$</span>
              <small>499$</small>
            </div>
            <div class="seller-label">Sale 10%</div>
            <div class="course-overlay">
              <a href="details.html" onclick="courseDetail(${item.id})">
                <h6 class="course-title">
                  ${item.title}
                </h6>
                <div class="course-author">
                  <b>Lê Trung Tín</b>
                  <span class="mx-1"> | </span>
                  <b class="text-capitalize">${item.categoryTitle}</b>
                </div>
                <div class="course-info">
                  <span><i class="fa fa-play-circle"></i> ${item.lectureCount}</span>
                  <span class="mx-1"> | </span>
                  <span><i class="fa fa-clock-o"></i> ${item.hourCount}</span>
                </div>
                <small class="course-content">
                  ${item.content}
                </small>
              </a>
							${courseBought.includes(item.id)
					? `<button class="btn-sm btn-dark text-white w-100" disabled>Add to cart</button>
              ` : `<button class="btn btn-sm btn-danger text-white w-100" onclick="addCart(${item.id})" id="addCartBtn_${item.id}">Add to cart</button> `}            </div>
          </div>
        </div>
  		`
			})
		} else {
			courses.slice(0, num).forEach(item => {
				htmlCourses += `
        <div class="col-md-3">
          <div class="course">
            <img src="${item.image}"/>
            <h6 class="course-title">${item.title}</h6>
            <small class="course-content">
              ${item.content}
            </small>
            <div class="course-price">
              <span>${item.price}$</span>
              <small>499$</small>
            </div>
            <div class="seller-label">Sale 10%</div>
            <div class="course-overlay">
              <a href="details.html" onclick="courseDetail(${item.id})">
                <h6 class="course-title">
                  ${item.title}
                </h6>
                <div class="course-author">
                  <b>Lê Trung Tín</b>
                  <span class="mx-1"> | </span>
                  <b class="text-capitalize">${item.categoryTitle}</b>
                </div>
                <div class="course-info">
                  <span><i class="fa fa-play-circle"></i> ${item.lectureCount}</span>
                  <span class="mx-1"> | </span>
                  <span><i class="fa fa-clock-o"></i> ${item.hourCount}</span>
                </div>
                <small class="course-content">
                  ${item.content}
                </small>
              </a>
              
              ${courseBought.includes(item.id)
					? `<button class="btn-sm btn-dark text-white w-100" disabled>Add to cart</button>
              ` : `<button class="btn btn-sm btn-danger text-white w-100" onclick="addCart(${item.id})" id="addCartBtn_${item.id}">Add to cart</button> `}
            </div>
          </div>
        </div>
  		`
			})
		}
	} else {
		if (num == null) {
			courses.forEach(item => {
				htmlCourses += `
        <div class="col-md-2">
          <div class="course">
            <img src="${item.image}"/>
            <h6 class="course-title">${item.title}</h6>
            <small class="course-content">
              ${item.content}
            </small>
            <div class="course-price">
              <span>${item.price}$</span>
              <small>499$</small>
            </div>
            <div class="seller-label">Sale 10%</div>
            <div class="course-overlay">
              <a href="details.html" onclick="courseDetail(${item.id})">
                <h6 class="course-title">
                  ${item.title}
                </h6>
                <div class="course-author">
                  <b>Lê Trung Tín</b>
                  <span class="mx-1"> | </span>
                  <b class="text-capitalize">${item.categoryTitle}</b>
                </div>
                <div class="course-info">
                  <span><i class="fa fa-play-circle"></i> ${item.lectureCount}</span>
                  <span class="mx-1"> | </span>
                  <span><i class="fa fa-clock-o"></i> ${item.hourCount}</span>
                </div>
                <small class="course-content">
                  ${item.content}
                </small>
              </a>
							<button class="btn btn-sm btn-danger text-white w-100" onclick="addCart(${item.id})" id="addCartBtn_${item.id}">Add to cart</button>            
						</div>
          </div>
        </div>
  		`
			})
		} else {
			courses.slice(0, num).forEach(item => {
				htmlCourses += `
        <div class="col-md-3">
          <div class="course">
            <img src="${item.image}"/>
            <h6 class="course-title">${item.title}</h6>
            <small class="course-content">
              ${item.content}
            </small>
            <div class="course-price">
              <span>${item.price}$</span>
              <small>499$</small>
            </div>
            <div class="seller-label">Sale 10%</div>
            <div class="course-overlay">
              <a href="details.html" onclick="courseDetail(${item.id})">
                <h6 class="course-title">
                  ${item.title}
                </h6>
                <div class="course-author">
                  <b>Lê Trung Tín</b>
                  <span class="mx-1"> | </span>
                  <b class="text-capitalize">${item.categoryTitle}</b>
                </div>
                <div class="course-info">
                  <span><i class="fa fa-play-circle"></i> ${item.lectureCount}</span>
                  <span class="mx-1"> | </span>
                  <span><i class="fa fa-clock-o"></i> ${item.hourCount}</span>
                </div>
                <small class="course-content">
                  ${item.content}
                </small>
              </a>
              <button class="btn btn-sm btn-danger text-white w-100" onclick="addCart(${item.id})" id="addCartBtn_${item.id}">Add to cart</button>
            </div>
          </div>
        </div>
  		`
			})
		}
	}
	return htmlCourses;
}

function showSaleOffCourses(courseBought) {
	axios({
		url: 'http://localhost:8082/api/course/list',
		method: 'GET'
	}).then(res => {
		let courseList = res.data;
		let htmlSaleOffCourse = "";

		htmlSaleOffCourse = htmlCourseList(courseList, 4, courseBought);

		let saleOffSec = document.getElementById("saleOffSec");
		saleOffSec.innerHTML = htmlSaleOffCourse;
	}).catch(err => {
		console.log(err)
	})
}

function showPopularCourses(courseBought) {
	axios({
		url: 'http://localhost:8082/api/course/list',
		method: 'GET'
	}).then(res => {
		let courseList = res.data;
		let htmlPopularCourse = "";

		htmlPopularCourse = htmlCourseList(courseList, null, courseBought);

		let popularSec1 = document.getElementById("popularSec1");
		popularSec1.innerHTML = htmlPopularCourse;
	}).catch(err => {
		console.log(err)
	})
}

function setBreadcrumbItem(elementId, title) {
	document.getElementById(elementId).innerHTML = title;
}

// show courses by a specific category
function showCoursesByCategory(cateId) {
	axios({
		url: 'http://localhost:8082/api/course/category',
		method: 'post',
		data: {
			"categoryId": cateId
		}
	}).then(res => {
		let courses = res.data;
		let htmlCourses = '';
		let divCourses = document.getElementById("coursesByCategory");
		htmlCourses = htmlCourseList(courses, null, courseBought);
		divCourses.innerHTML = htmlCourses;
	}).catch(err => {
		console.log(err);
	})
}

// show courses by a specific category
function showSearchResult(searchText) {
	axios({
		url: 'http://localhost:8082/api/course/find',
		method: 'post',
		data: {
			"titleString": searchText
		}
	}).then(res => {
		let courses = res.data;
		let htmlCourses = '';
		let divCourses = document.getElementById("searchResult");

		if (courses.length <= 0) {
			htmlCourses = `
				<h2 class="text-danger m-auto">No Courses Found</h2>
			`
		} else {
			htmlCourses = htmlCourseList(courses, null, courseBought);
		}
		divCourses.innerHTML = htmlCourses;

	}).catch(err => {
		console.log(err);
	})
}