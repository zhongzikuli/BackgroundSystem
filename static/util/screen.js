

let screenUtil =(function(){
   function init(){
        let viewport = document.querySelector("meta[name=viewport]");
        let width=window.screen.width;
        let r=width/1200;
        if(r<1)viewport.setAttribute('content', 'width=device-width, initial-scale='+r+', maximum-scale=1, user-scalable=no');
   }
   return {
       init,
   }
})()
screenUtil.init();
