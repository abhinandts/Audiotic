(function (){
    window.showToast = function (message, type) {
        let backgroundColor;
        switch(type) {
            case 'success':
                backgroundColor = "linear-gradient(to right, #00b09b, #96c93d)";
                break;
            case 'error':
            case 'warning':
                backgroundColor = "linear-gradient(to right, #ff5f6d, #ffc371)";
                break;
            default:
                backgroundColor = "linear-gradient(to right, #3498db, #2980b9)";
        }

        Toastify({
            text: message,
            duration: 3000,
            close: true,
            gravity: "top",
            position: "right",
            backgroundColor: backgroundColor,
        }).showToast();
    }
})()