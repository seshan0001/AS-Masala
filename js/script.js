$(function(){

    if($('#bannerSwiper').length) {
        bannerSlider();
    }

    if($('#CarouselSlider').length) {
        CarouselSlider();
    }

    $("body").on("click",".burgerMenu",function(){
        $("html").toggleClass("mobileMenuOpen");
        $(".mobileMenuWrap").slideToggle();
    });
    
    $(".content").css("margin-top",$(".header").outerHeight());
    $(".mobileMenuWrap").css("top",$(".header").outerHeight());
    $(window).on("resize",function(){
        $(".content").css("margin-top",$(".header").outerHeight());
        $(".mobileMenuWrap").css("top",$(".header").outerHeight());
    });

    new WOW().init();

    function bannerSlider() {
        var bannerSlider = new Swiper('#bannerSwiper', {
            loop: true,
            speed: 600,
            autoplay: true,
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
        });
    }

    function CarouselSlider() {
        var CarouselSlider = new Swiper('#CarouselSlider', {
            slidesPerView: 3,
            spaceBetween: 30,
            loop: true,
            speed: 600,
            autoplay: true,
            breakpoints: {
                0: {
                    slidesPerView: 1,
                    spaceBetween: 22,
                },
                750: {
                    slidesPerView: 2,
                    spaceBetween: 26,
                },
                950: {
                    slidesPerView: 3,
                }
            }
        });
    }

    function thumPreview() {
        settimeout(function(){
            $(".PreviewImgWrapContent").css("width", $(".viewProductPageTopImg").width());
        },100)
        var thumbSwiper = new Swiper("#previewImgSlider", {
            spaceBetween: 10,
            slidesPerView: 4,
            freeMode: true,
            watchSlidesProgress: true,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },
        });
        var mainSwiper = new Swiper("#viewImgSlider", {
            slidesPerView: 1,
            autoplay: {
                delay: 2000,
                disableOnInteraction: false,
            },
            thumbs: {
                swiper: thumbSwiper,
            },
        });
        function setThumbActive(index) {
            $(".PreviewImg").removeClass("thumb-active");
            $(".PreviewImg").eq(index).addClass("thumb-active");
        }
        thumbSwiper.on("click", function () {
            if (thumbSwiper.clickedIndex !== undefined) {
                let realIndex = thumbSwiper.clickedIndex % $(".PreviewImg").length;
                mainSwiper.slideToLoop(realIndex);
                setThumbActive(realIndex);
            }
        });
        mainSwiper.on("slideChange", function () {
            let realIndex = mainSwiper.realIndex;
            setThumbActive(realIndex);
            thumbSwiper.slideToLoop(realIndex);
        });
        $("#previewImgSlider, #viewImgSlider")
        .on("mouseenter", function () {
            mainSwiper.autoplay.stop();
            thumbSwiper.autoplay.stop();
        })
        .on("mouseleave", function () {
            mainSwiper.autoplay.start();
            thumbSwiper.autoplay.start();
        });
        setThumbActive(mainSwiper.realIndex);
    }


    function getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }


    function enableImageZoom(selector, scale = 2) {
        const containers = document.querySelectorAll(selector);

        containers.forEach((container) => {
            const img = container.querySelector("img");
            if (!img) return;
            container.addEventListener("mousemove", (e) => {
            const { left, top, width, height } = container.getBoundingClientRect();
            const x = ((e.pageX - left) / width) * 100;
            const y = ((e.pageY - top) / height) * 100;

            img.style.transformOrigin = `${x}% ${y}%`;
            img.style.transform = `scale(${scale})`;
            });

            container.addEventListener("mouseleave", () => {
            img.style.transformOrigin = "center center";
            img.style.transform = "scale(1)";
            });
        });
    }

    if ($("#viewPage").length) {

        enableImageZoom('.viewProductPageTopImgWrap');

        const productId = getUrlParam("id");
        if (!productId) {
            console.error("No product ID found in URL");
            return;
        }


        $.ajax({
            url: "/AS-Masala/js/data.json",
            dataType: "json",
            success: function(data) {
                const product = data.products.find(p => p.id == productId);
                if (product) {

                    //name,description,howtouse
                    $(".productTitle").text(product.name);
                    $(".productDesc").text(product.description);
                    $(".paragraphDesc").text(product.paragraphDesc.replace(/\n/g, "<br>"));
                    $(".howtoUse").html(product.howtouse.replace(/\n/g, "<br>"));
                    
                    //quantity Btn
                    $(".productQuantityBtnWrap").empty();
                    product.price.forEach(function(ele){
                        var quantityBtn = `<a class="productQuantityBtn" data-id='${ele.id}'>${ele.weight}</a>`;
                        $(".productQuantityBtnWrap").append(quantityBtn);
                    });

                    //Price Value
                    $(`.productQuantityBtn[data-id='${0}']`).addClass("active");
                    $('.newPrice').text(product.price[0].new);
                    $('.oldPrice').text(product.price[0].old);
                    $("body").on("click",".productQuantityBtn",function(){
                    var eleId = $(this).data("id");
                        $('.newPrice, .oldPrice').addClass("hide");
                        setTimeout(function(){
                            $(`.productQuantityBtn`).removeClass("active");
                            $(`.productQuantityBtn[data-id='${eleId}']`).addClass("active");
                            $('.newPrice').text(product.price[eleId].new);
                            $('.oldPrice').text(product.price[eleId].old);
                            $('.newPrice, .oldPrice').removeClass("hide");
                        },300);

                    });

                    //Images
                    $(".viewProductPageTopImgSec").empty();
                    $(".PreviewImgWrap").empty();
                    product.images.forEach(function(ele){
                        var mainImg = `<img class="viewProductPageTopImg swiper-slide" src="/AS-Masala/images/${ele}" ></img>`;
                        var previewImg = `<img class="PreviewImg swiper-slide" src="/AS-Masala/images/${ele}" ></img>`;

                        $(".viewProductPageTopImgSec").append(mainImg);
                        $(".PreviewImgWrap").append(previewImg);
                    });

                    //Ingredients
                    $(".ingredientsList").empty();
                    product.ingredientsList.forEach(function(ele){
                        var li = `<li>${ele}</li>`;
                        $(".ingredientsList").append(li);
                    });

                } else {
                    console.error("Product not found for ID:", productId);
                }
            },
            error: function(xhr, status, error) {
                console.error("Error loading JSON:", status, error);
            },
            complete: function(){
                thumPreview();
                $(window).on("resize",function(){
                    thumPreview();
                });
            }
        });
    }

});

