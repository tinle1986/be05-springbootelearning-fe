// logout
function logOut() {
	localStorage.clear();
	// localStorage.removeItem("ut");
	window.location.reload();
}

function disableAddCartAndBuyButton(course) {
	// disable buy button when already bought current course
	let courseList = JSON.parse(localStorage.getItem("courseBought"));
	let alreadyBought = courseList.includes(course.id.toString()) || courseList.includes(course.id);
	if (alreadyBought) {
		document.getElementById("buyOneBtn").setAttribute("disabled", true);
		document.getElementById("addCartBtn").setAttribute("disabled", true);
	}
}

// get list of course bought
function getCourseBoughtList(token, course) {
	axios({
		url: 'http://localhost:8082/api/course/purchase/bought',
		method: 'get',
		headers: {
			Authorization: 'Bearer ' + token
		}
	}).then(res => {
		localStorage.setItem("courseBought", JSON.stringify(res.data));
		disableAddCartAndBuyButton(course);
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
			console.log(token);
			localStorage.setItem("ut", token);
			document.getElementById("lgPassword").value = "";
			document.getElementById("lgEmail").value = "";
			alert("Signed in successfully!");
			window.location.reload();
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
function buyAll(token, course) {
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
			// console.log(res.data);
			clearCart();
			let courseList = JSON.parse(localStorage.getItem("courseBought"));
			selectedCourses.forEach(courseItem => {
				courseList.push(courseItem);
			})
			localStorage.setItem("courseBought", JSON.stringify(courseList));
			disableAddCartAndBuyButton(course);
		}).catch(err => {
			console.log(err);
		})
	}
}

// buy current course function
function buyOne(token, value, course) {
	// when click on Buy Now button, will show modal if without login token
	if (token == null) {
		$("#loginModal").modal('show');
	} else {
		let courseToBuy = {
			cartList: [value]
		};
		axios({
			url: 'http://localhost:8082/api/course/purchase',
			method: 'POST',
			headers: {
				Authorization: 'Bearer ' + token,
			},
			data: courseToBuy
		}).then(res => {
			// console.log(res.data);
			clearCart();
			let courseList = JSON.parse(localStorage.getItem("courseBought"));
			courseList.push(courseId);
			localStorage.setItem("courseBought", JSON.stringify(courseList));
			disableAddCartAndBuyButton(course);
		}).catch(err => {
			console.log(err);
		})
	}
}

// clear cart, remove localStorage
function clearCart() {
	localStorage.removeItem("courseInCart");
	document.getElementById("cartCount").innerHTML = 0;

	document.getElementById("selectedCourses").innerHTML = `
    	   <a class="dropdown-item disable-links" href="#">No Course To Purchase</a>
    	`
	document.getElementById("purchaseCoursesBtn").classList.add("disable-links");
	document.getElementById("clearCoursesBtn").classList.add("disable-links");


	// window.location.reload();
}

// add cart function, add courseId into courses selected
function addCart(value) {
	// check cart count
	let courseInCart = JSON.parse(localStorage.getItem("courseInCart"));
	if (courseInCart == null) {
		courseInCart = [];
	}

	courseInCart.push(value);

	// deduplicate item
	courseInCart = [...new Set(courseInCart)];
	document.getElementById("cartCount").innerHTML = courseInCart.length;
	document.getElementById("purchaseCoursesBtn").classList.remove("disable-links");
	document.getElementById("clearCoursesBtn").classList.remove("disable-links");

	// show cart list
	axios({
		url: 'http://localhost:8082/api/course/cart',
		method: 'POST',
		data: {
			cartList: courseInCart
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

	localStorage.setItem("courseInCart", JSON.stringify(courseInCart));
}

// fetch course details
function getCourseDetails(token, id) {
	axios({
		url: `http://localhost:8082/api/course/detail/${id}`,
		method: 'GET',
	}).then(res => {
		// localStorage.setItem("courseDetails", JSON.stringify(res.data));
		// courseDetails = JSON.parse(localStorage.getItem("courseDetails"));
		let course = res.data;
		// console.log(course);

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
		document.getElementById("price").innerHTML = course.price + " $";
		document.getElementById("addCartBtn").setAttribute("value", course.id);
		document.getElementById("buyOneBtn").setAttribute("value", course.id);

		if (token) {
			getCourseBoughtList(token, course);
			// disableAddCartAndBuyButton(course);
		}

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
		if (courseInCart.length === 0) {
			document.getElementById("selectedCourses").innerHTML = `
    	   <a class="dropdown-item disable-links" href="#">No Course To Purchase</a>
    	`
			document.getElementById("purchaseCoursesBtn").classList.add("disable-links");
			document.getElementById("clearCoursesBtn").classList.add("disable-links");
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
		}

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
			htmlMenu += `<a class="dropdown-item" href="#">
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
	// check login
	let rightMenuHtml = "";

	if (token) {
		rightMenuHtml = `
      <div class="dropdown">
        <div class="dropdown-toggle font-weight-bold text-dark btn" data-toggle="dropdown" id="rightMenuTitle">
          Cybersoft
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

		getCourseDetails(token, id)
	}

}

