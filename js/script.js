$(function () {

    if ($('#bannerSwiper').length) {
        bannerSlider();
    }

    if ($('#CarouselSlider').length) {
        CarouselSlider();
    }

    if ($('#viewPage').length) {
        const productId = getUrlParam("product");
        if (productId) {
            $(".productSinlePageContent").show();
        } else {
            $(".productListingPageContent").show();
        }
    }

    $("body").on("click", ".burgerMenuWrap", function () {
        $("html").toggleClass("mobileMenuOpen");
        $(".mobileMenuWrap").slideToggle();
    });

    $(".content").css("margin-top", $(".header").outerHeight());
    $(".mobileMenuWrap").css("top", $(".header").outerHeight());
    $(window).on("resize", function () {
        $(".content").css("margin-top", $(".header").outerHeight());
        $(".mobileMenuWrap").css("top", $(".header").outerHeight());
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
            slidesPerView: 4,
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
                    slidesPerView: 3,
                    spaceBetween: 26,
                },
                950: {
                    slidesPerView: 4,
                }
            }
        });
    }

    function thumPreview() {
        setTimeout(function () {
            $(".PreviewImgWrapContent").css("width", $(".viewProductPageTopImg").width());
        }, 100)
        var thumbSwiper = new Swiper("#previewImgSlider", {
            spaceBetween: 10,
            slidesPerView: 4,
            freeMode: true,
            watchSlidesProgress: true,
            autoplay: {
                delay: 5000,
                disableOnInteraction: false,
            },
        });
        var mainSwiper = new Swiper("#viewImgSlider", {
            slidesPerView: 1,
            autoplay: {
                delay: 5000,
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

    function whatsappMsgGen (ele) {
        var productName = ele.closest('.viewProductPageInfoWrap').find(".productTitle").text();
        var message = "Hi, I want to know more about " + productName;
        var encodedMsg = encodeURIComponent(message);
        var whatsappLink = "https://wa.me/7200579714?text=" + encodedMsg;
        ele.closest('.viewProductPageInfoWrap').find(".whatsappBtn").attr("href", whatsappLink);
    }

    if ($("#viewPage").length) {

        enableImageZoom('.viewProductPageTopImgWrap');

        const productId = getUrlParam("product");
        if (!productId) {
            return;
        }

        $.ajax({
            url: "/js/data.json",
            dataType: "json",
            success: function (data) {
                const product = data.products.find(p => p.id == productId);
                if (product) {

                    //name,description,recipe
                    $(".productSinlePageContent .offerBanner .headerTitle").html(product.name);
                    $(".productTitle").html(product.name);
                    $(".productDesc").html(product.description);
                    $(".paragraphDesc").html(product.paragraphDesc.replace(/\n/g, "<br>"));
                    $(".recipe").html(product.recipe.replace(/\n/g, "<br>"));

                    //quantity Btn
                    $(".productQuantityBtnWrap").empty();
                    product.price.forEach(function (ele) {
                        var quantityBtn = `<a class="productQuantityBtn" data-id='${ele.id}'>${ele.weight}</a>`;
                        $(".productQuantityBtnWrap").append(quantityBtn);
                    });

                    //Price Value
                    $(`.productQuantityBtn[data-id='${0}']`).addClass("active");
                    $('.newPrice').html(product.price[0].new);
                    $('.oldPrice').html(product.price[0].old);
                    $("body").on("click", ".productQuantityBtn", function () {
                        var eleId = $(this).data("id");
                        $('.newPrice, .oldPrice').addClass("hide");
                        setTimeout(function () {
                            $(`.productQuantityBtn`).removeClass("active");
                            $(`.productQuantityBtn[data-id='${eleId}']`).addClass("active");
                            $('.newPrice').html(product.price[eleId].new);
                            $('.oldPrice').html(product.price[eleId].old);
                            $('.newPrice, .oldPrice').removeClass("hide");
                        }, 300);

                    });

                    //Images
                    $(".viewProductPageTopImgSec").empty();
                    $(".PreviewImgWrap").empty();
                    product.images.forEach(function (ele) {
                        var mainImg = `<img class="viewProductPageTopImg swiper-slide" src="/images/${ele}" ></img>`;
                        var previewImg = `<img class="PreviewImg swiper-slide" src="/images/${ele}" ></img>`;

                        $(".viewProductPageTopImgSec").append(mainImg);
                        $(".PreviewImgWrap").append(previewImg);
                    });

                    //Ingredients
                    $(".ingredientsList").empty();
                    product.ingredientsList.forEach(function (ele) {
                        var li = `<li>${ele}</li>`;
                        $(".ingredientsList").append(li);
                    });

                } else {
                    console.error("Product not found for ID:", productId);
                }
            },
            error: function (xhr, status, error) {
                console.error("Error loading JSON:", status, error);
            },
            complete: function () {
                thumPreview();
                $(window).on("resize", function () {
                    thumPreview();
                });
                if ($('.whatsappBtn').length) {
                    $('.whatsappBtn').each(function(){
                        whatsappMsgGen($(this));
                    });
                }
            }
        });
    }

});

