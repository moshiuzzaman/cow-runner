class Constant{
    static  SmallScreen=550;
    static  MediumScreen=1100;
    static  LargeScreen=1200;
    static  ExtraLargeScreen=1400;
    static IsMobile()
    {
        var width=window.innerWidth;
        console.log(window.innerWidth,this.SmallScreen);
        if(width<=this.SmallScreen){
            return true;
        }
        else{
            return false;
        }
    }
}
export default Constant;