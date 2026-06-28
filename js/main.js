//가로스크롤
$(document).ready(function(){
    let d_width = 0; // 브라우저 가로
    let d_height = 0; // 문서 전체의 높이

    function tmp() {
        // container의 가로사이즈(화면가로 * box 개수)
        let con_width = $(window).outerWidth() * $('.sub02_box').length; 

        $('.sub02_container').css({
            width: con_width,
            height: '100vh',
            position: 'fixed',
            top: 0,
            left: 0
        });

        // css에서 해도 상관없다.
        $('.sub02_box').css({
            width: con_width / $('.sub02_box').length,
            height: '100vh',
            float: 'left'
        });

        // box들을 위로 끌어올렸기 때문에 body의 높이는 100vh나 마찬가지인 상태. 
        // 그래서 억지로 전체 box들의 세로크기 만큼 body에 줘야한다.(스크롤 내리기위함) 
        // 이때 높이는 가로영역의 비율과 동일하게 준다. (이후 리미트를 주게 됨으로써 비율의 값이 정해진다.)
        $('.sub02').css({
            height: '100vh'
        });

        let w_width = $(window).width(); // 화면의 가로값
        let w_height = $(window).height() // 화면의 세로값

        // 스크롤 될때의 리미트
        d_width = con_width - w_width; // 전체 가로값 - 현재 화면의 가로값
        d_height = $('.sub02').height() - w_height // 전체 세로값 - 현재 화면의 세로값
    }

    tmp();

    let array = [];
    for(let i=0; i<$('.sub02_box').length; i++) {
        array[i] = $('.sub02_box').eq(i).offset().left
    }

    let chk = true;
    $('.sub02_box').on('mousewheel DOMMouseScroll', function(){

        if(chk) {
            // 휠 일정시간동안 막기
            chk = false;
            setTimeout(function(){
                chk = true;
            }, 500)

            // 휠 방향 감지(아래: -120, 위: 120)
            let w_delta = event.wheelDelta / 120;
            
            // 휠 아래로
            if(w_delta < 0 && $(this).next().length > 0) {
                $('.sub02_container').animate({
                    left: -array[$(this).index()+1]
                }, 500)
            }
            // 휠 위로
            else if(w_delta > 0 && $(this).prev().length > 0) {
                $('.sub02_container').animate({
                    left: -array[$(this).index()-1]
                }, 500)
            }
        }
    });

    //브라우저를 resize했을시를 대비해 박스의 크기는 다시 구해준다.
    $(window).resize(function(){
        for(let i=0; i<$('.sub02_box').length; i++) {
            array[i] = $('.sub02_box').eq(i).offset().left
        }

        tmp();
    })

});



$(document).ready(function(){

    //디자인스타일에 녹색텍스트스타일
    const left = document.getElementById("left-side");

    const handleMove = e => {
      left.style.width = `${e.clientX / window.innerWidth * 100}%`;
    }
    
    document.onmousemove = e => handleMove(e);
    
    document.ontouchmove = e => handleMove(e.touches[0]);





    $('.sub10 .slide_title h2').addClass('on'); 
    //sub10.php
    $('.autoplay').slick({
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 6000,
        fade: true,
    });
    

    $('.autoplay').on('beforeChange', function(event, slick, currentSlide, nextSlide) {
        // 기존 애니메이션 초기화
        $('.sub10 .slide_title h2').removeClass('on'); // 이전 클래스 제거

        const colors = ['#FFD2BF', '#FFB2B2', '#B2D4FF', '#D2FFB2'];
        const newColor = colors[nextSlide % colors.length]; // 다음 슬라이드에 맞는 색상 선택
        $('.sub10 .slide .mask path').attr('fill', newColor); // SVG의 fill 색상 변경

        const texts = ['COMPANY', 'ABOUT', 'DESIGN', 'STYLE'];
        const newText = texts[nextSlide % texts.length]; // 텍스트 배열에서 새로운 텍스트 선택
        $('.sub10 .slide_title h2').text(newText); 

        // 배경색 변경
        $('.sub10 .slide .mask .bg.bottom').css('background-color', newColor);

        // 애니메이션 클래스 추가
        $('.sub10 .slide .mask .bg.bottom').css('animation', 'sub10slideUp 1s forwards');
        
        // 애니메이션 후에 원래 위치로 되돌리기
        setTimeout(function() {
            $('.sub10 .slide .mask .bg.bottom').css('animation', '');
        }, 1000); // 애니메이션 시간과 일치
    });

    $('.autoplay').on('afterChange', function(event, slick, currentSlide) {
        // 애니메이션 클래스 추가
        $('.sub10 .slide_title h2').addClass('on');
    });
    //sub10.php끝
    

    //메인헤더
    $(".gnb > li").hover(
        function () {
            const liHeight = $(this).outerHeight(); // li의 높이값을 가져옴
            $(this).find(".sub_menu").css("top", liHeight + "px"); // 서브 메뉴의 top 값을 설정
            $(this).find(".sub_menu").stop(true, true).slideDown(200); // 서브 메뉴 나타남
        },
        function () {
            $(this).find(".sub_menu").stop(true, true).slideUp(200); // 서브 메뉴 사라짐
        }
    );

    //햄버거
    $(".hamburger-icon").click(function () {
        $(".menu").toggleClass("open"); // 메뉴 열기/닫기 클래스 토글
    });



    //팝업기본 sub04.php 팝업오픈이랑 클로즈 클래스 넣어서 한꺼번에 처리하는것
    $(".openPopup").on("click", function () {
        const popupId = $(this).data("popup");
        $("#" + popupId).show();
        $("body").append('<div class="backon"></div>');
    });

    $("body").on("click", function (event) {
        if ($(event.target).hasClass('close') || $(event.target).hasClass('backon')) {
            $(".popup").hide();
            $(".backon").remove();
        }
    });
          

    //메뉴에색상변경
    const colors = [
        '#ffea83', 
        '#ff9283', 
        '#83ff99', 
        '#83FFF5', 
        '#83FFC1', 
        '#A0FF83',
        '#FFFF83', 
        '#FF8383'  
    ];

    $(".gnb > li").hover(
        function () {
            const index = $(this).index(); // 현재 li의 인덱스
            $(this).css("background", colors[index]); // 배경 색상 변경
            $(this).find(".sub_menu li").hover(
                function () {
                    $(this).css("background", colors[index]); // 서브 메뉴 색상 변경
                },
                function () {
                    $(this).css("background", ""); // 서브 메뉴 색상 초기화
                }
            );
        },
        function () {
            $(this).css("background", ""); // 기본 배경 색상으로 초기화
        }
    );


    //파일아이콘 on off
    $('.icon01').on("click",function() {
        $(this).addClass('fa-bounce');
    });

    //로그인비밀번호눈
    $('.icon-eye i.fa-solid').on('click', function() {
        $('#login_pw').toggleClass('active');
        if ($('#login_pw').hasClass('active')) {
            $(this).attr("class", "fa-solid fa-eye fa-lg")
                .closest('.icon-eye').siblings('#login_pw').attr("type", "text");
        } else {
            $(this).attr("class", "fa-solid fa-eye-slash fa-lg")
                .closest('.icon-eye').siblings('#login_pw').attr("type", "password");
        }
    });



    new Swiper('.swiper', {
        // direction: 'vertical', // 슬라이드 진행 방향, 기본값 horizontal(가로)
  
        // autoplay: true 도 가능하지만 객체 데이터로 할당하면 추가적인 옵션 설정 가능
        autoplay: {
            // 자동재생 여부
            delay: 5000, // 시작시간 설정
        },
        loop: true, // 반복재생 여부
        slidesPerView: 1, // 한번에 보여줄 슬라이드 개수
        spaceBetween: 10, // 슬라이드 사이 여백
        centeredSlides: true, // 1번 슬라이드가 가운데 보이기
        
        // 페이저 버튼 사용자 설정
        pagination: {
            // 페이지 번호 요소 선택자
            el: '.promotion .swiper-pagination',
            
            // 사용자의 페이지 번호 요소 제어 가능 요소 (사용자가 단순히 시각적으로만 보는것 뿐만아니라 눌러서 제어할 수 있는지에 대한 여부)
            clickable: true,
        },
        
        // nav 화살표 출력 시 추가
        navigation: {
            prevEl: '.swiper-prev',
            nextEl: '.swiper-next',
        },
    })


    //스크롤이벤트 섹션별로 저장해서 하는방법
    $(window).on("scroll", function () {
        let scroll = $(window).scrollTop();
        let sections = [];
        let numSections = $(".scroll").children().length;

        for (let i = 0; i < numSections; i++) {
            sections.push($("#contents_0" + i));
        }
    
        sections.forEach((section, index) => {
            let sectionTop = section.offset().top;
            if (sectionTop <= scroll + 500 && (index === sections.length - 1 || scroll <= sections[index + 1].offset().top)) {
                section.addClass("active");
            } else {
                section.removeClass("active");
            }
        });
    });
    


    //아코디언
    $(".que").click(function() {
        $(this).next(".anw").stop().slideToggle(300);
        $(this).toggleClass('on').siblings().removeClass('on');
        $(this).next(".anw").siblings(".anw").slideUp(300);
    });



    //커스텀셀렉트박스
    $('.search_choice_head').click(function(e) {
        $(this).next().toggleClass('on', 200);
    });

    $('.search_choice>ul>li>a').click(function(e) {
        e.preventDefault();
        var selectedText = $(this).text();
        $('.search_choice>ul').removeClass('on');
        $('.search_choice>ul').prev('input').val(selectedText);
    });

    
    //새로고침후에 위치 확인하는법
    var scload = $(document).scrollTop();
    if(scload==0) {
        // $(".top_btn").hide();
    }
    if(scload>=1) {
        // $(".top_btn").show();
    }


    //top버튼
    $(window).on("scroll", function () {
        let scroll = $(window).scrollTop();
        if(scroll >=1) {
            $(".top_btn").show();
        }
        if(scroll ==0) {
            $(".top_btn").hide();
        }
    });
    $(".top_btn").click(function() {
        $('html, body').animate({scrollTop:0}, 400);
        return false;
    });

    

    //top버튼
    (function($) { "use strict";
        $(document).ready(function(){"use strict";
        
            //Scroll back to top
            
            var progressPath = document.querySelector('.progress-wrap path');
            var pathLength = progressPath.getTotalLength();
            progressPath.style.transition = progressPath.style.WebkitTransition = 'none';
            progressPath.style.strokeDasharray = pathLength + ' ' + pathLength;
            progressPath.style.strokeDashoffset = pathLength;
            progressPath.getBoundingClientRect();
            progressPath.style.transition = progressPath.style.WebkitTransition = 'stroke-dashoffset 10ms linear';		
            var updateProgress = function () {
                var scroll = $(window).scrollTop();
                var height = $(document).height() - $(window).height();
                var progress = pathLength - (scroll * pathLength / height);
                progressPath.style.strokeDashoffset = progress;
            }
            updateProgress();
            $(window).scroll(updateProgress);	
            var offset = 50;
            var duration = 550;
            jQuery(window).on('scroll', function() {
                if (jQuery(this).scrollTop() > offset) {
                    jQuery('.progress-wrap').addClass('active-progress');
                } else {
                    jQuery('.progress-wrap').removeClass('active-progress');
                }
            });				
            jQuery('.progress-wrap').on('click', function(event) {
                event.preventDefault();
                jQuery('html, body').animate({scrollTop: 0}, duration);
                return false;
            })
            
            
        });
        
    })(jQuery); 



    
    //서브페이지에 따라 알맞은 헤더에 클래스(서브페이지는 section에 클래스넣고 아래에 넣지)
    const sectionClass = document.querySelector('section').className;
    const links = document.querySelectorAll('ul.gnb a');

    // 메인 메뉴 링크에 대한 상태 설정
    links.forEach(link => {
        if (link.textContent === 'Design_style' && sectionClass.includes('sub01')) {
            link.classList.add('on');
        } else if (link.textContent === 'jquery' && (sectionClass.includes('sub02') || sectionClass.includes('sub03') || sectionClass.includes('sub04' ) || sectionClass.includes('sub07' ))) {
            link.classList.add('on');
        } else if (link.textContent === 'form' && (sectionClass.includes('sub05') || sectionClass.includes('sub06'))) {
            link.classList.add('on');
        }
    });

    // 서브 메뉴 링크에 이벤트 리스너 추가
    links.forEach(link => {
        if (link.closest('ul.sub_menu')) {
            link.addEventListener('click', () => {
                const parentLink = link.closest('ul.sub_menu').closest('li').querySelector('a');
                if (parentLink) {
                    parentLink.classList.add('on');
                }
            });
        }
    });



    
    
    //메뉴스타일1
    const hamburger = document.querySelector('.hamburger');
    const menuItems = document.querySelectorAll('.menu-item');

    hamburger.addEventListener('change', () => {
        menuItems.forEach(item => {
            const submenu = item.querySelector('.submenu');
            if (!hamburger.checked) {
                submenu.style.display = 'none'; // 체크 해제 시 하위 메뉴 숨기기
            } else {
                submenu.style.display = 'block'; // 체크 시 하위 메뉴 보이기
            }
        });
    });

    menuItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            if (!hamburger.checked) {
                item.querySelector('.submenu').style.display = 'block'; // 호버 시 하위 메뉴 보이기
            }
        });
        item.addEventListener('mouseleave', () => {
            item.querySelector('.submenu').style.display = 'none'; // 호버 해제 시 숨기기
        });
    });


    
    

});

//헤더스타일2
$(document).ready(function() {
    let lastScrollTop = 0;
    const header = $('#header02');
    let timeout;

    $(window).on('scroll', function() {
        clearTimeout(timeout); // 이전 타이머를 지웁니다.
        const scrollTop = $(this).scrollTop();

        if (scrollTop > lastScrollTop) {
            // 아래로 스크롤
            header.addClass('hidden');
        } else {
            // 위로 스크롤
            header.removeClass('hidden');
        }

        // 스크롤이 멈추면 헤더를 다시 나타냅니다.
        timeout = setTimeout(function() {
            header.removeClass('hidden');
        }, 500); // 200ms 후 헤더를 다시 나타냅니다.
        
        lastScrollTop = scrollTop;
    });
});





$(document).ready(function () {
    const fileList = [];

    $('#fileInput').on('change', function (event) {
        const files = event.target.files;
        for (let i = 0; i < files.length; i++) {
            fileList.push(files[i]);
        }
        updateFileList();
        event.target.value = ''; // 파일 선택 후 input 초기화
    });

    function updateFileList() {
        const fileListDiv = $('#fileList');
        fileListDiv.empty();
        
        fileList.forEach((file, index) => {
            const fileItem = $('<div class="file-item"></div>');
            fileItem.append(`<span>${file.name}</span>`);
            const removeBtn = $('<span class="remove-btn">삭제</span>');
            removeBtn.on('click', function () {
                fileList.splice(index, 1); // 배열에서 파일 제거
                updateFileList(); // 리스트 갱신
            });
            fileItem.append(removeBtn);
            fileListDiv.append(fileItem);
        });
    }
});


//각페이지 로드 애니메이션
// $(document).ready(function() {
//     $('.gnb a').on('click', function(event) {
//         const targetUrl = $(this).attr('href');

        
//         if (targetUrl && targetUrl !== 'javascript:();') {
//             event.preventDefault(); // 기본 링크 이동 막기

//             // 현재 콘텐츠 ID 가져오기
//             const currentContentId = $(this).closest('.content').attr('id');
//             console.log(currentContentId); // ID 로그 출력

//             // ID에 해당하는 콘텐츠 아래로 내리기
//             if (currentContentId) {
//                 $('#' + currentContentId).css('transform', 'translateY(-100%)');
//             }

//             // 일정 시간 후에 페이지 이동
//             setTimeout(() => {
//                 window.location.href = targetUrl; // 페이지 이동
//             }, 500); // 애니메이션 시간
//         }
//     });
//     console.log(currentContentId);
// });


$(document).ready(function() {
    const $slider = $(".slider");

    $slider.on('init', function() {
        mouseWheel($slider);
    });

    $slider.slick({
        dots: true,
        vertical: false,
        infinite: true,
    });

    function mouseWheel($slider) {
        $(window).on('wheel', function(event) {
            event.preventDefault();
            const delta = event.originalEvent.deltaY;
            if (delta > 0) {
                $slider.slick('slickNext');
            } else {
                $slider.slick('slickPrev');
            }
        });
    }
});


