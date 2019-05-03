import java.io.File;
import java.io.IOException;
import java.awt.image.BufferedImage;
import javax.imageio.ImageIO;
import java.awt.*;
public class RandomImage{

  public static void main(String args[])throws IOException{

/*============================================================================*/
/*================================ DIRT BLOCK ================================*/
/*============================================================================*/
    for (int i = 0; i < 10; i++) {
      //image dimension
      int width = 8;
      int height = 8;
      //create buffered image object img
      BufferedImage img = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
      //file object
      File f = null;
      Color brown;
      //create random image pixel by pixel
      for(int y = 0; y < height; y++){
        for(int x = 0; x < width; x++){

          int rand = (int)(Math.random()*6);

          switch(rand) {
           case 0:
             brown = new Color(148, 77, 0);
             break;
           case 1:
             brown = new Color(61, 32, 0);
             break;
           default:
             brown = new Color(114, 59, 0);
          }

          int brownRGB = brown.getRGB();
          img.setRGB(x, y, brownRGB);
        }
      }
      img = resize(img, 32, 32);
      //write image
      try{
        String fileName = "static/images/block/dirt" + String.valueOf(i) + "_block.png";
        f = new File(fileName);
        ImageIO.write(img, "png", f);
      }catch(IOException e){
        System.out.println("Error: " + e);
      }

      img = resize(img, 16, 16);
      //write image
      try{
        String fileName = "static/images/item/dirt" + String.valueOf(i) + "_item.png";
        f = new File(fileName);
        ImageIO.write(img, "png", f);
      }catch(IOException e){
        System.out.println("Error: " + e);
      }
    }
/*============================================================================*/
/*================================ GOLD BLOCK ================================*/
/*============================================================================*/
    for (int i = 0; i < 10; i++) {
      //image dimension
      int width = 8;
      int height = 8;

      //create buffered image object img
      BufferedImage img = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
      //file object

      File f = null;
      Color gold;

      //create random image pixel by pixel
      for(int y = 0; y < height; y++){
        for(int x = 0; x < width; x++){

          int rand = (int)(Math.random()*6);

          switch(rand) {
           case 0:
             gold = new Color(255, 174, 0);
             break;
           case 1:
             gold = new Color(255, 240, 0);
             break;
           default:
             gold = new Color(255, 216, 0);
          }

          int goldRGB = gold.getRGB();
          img.setRGB(x, y, goldRGB);
        }
      }

      img = resize(img, 32, 32);

      //write image
      try{
        String fileName = "static/images/block/gold" + String.valueOf(i) + "_block.png";
        f = new File(fileName);
        ImageIO.write(img, "png", f);
      }catch(IOException e){
        System.out.println("Error: " + e);
      }

      img = resize(img, 16, 16);
      //write image
      try{
        String fileName = "static/images/item/gold" + String.valueOf(i) + "_item.png";
        f = new File(fileName);
        ImageIO.write(img, "png", f);
      }catch(IOException e){
        System.out.println("Error: " + e);
      }
   }
/*============================================================================*/
/*================================ WATER BLOCK ===============================*/
/*============================================================================*/
   for (int i = 0; i < 10; i++) {
     //image dimension
     int width = 8;
     int height = 8;

     //create buffered image object img
     BufferedImage img = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
     //file object

     File f = null;
     Color water;

     //create random image pixel by pixel
     for(int y = 0; y < height; y++){
       for(int x = 0; x < width; x++){

         int rand = (int)(Math.random()*6);

         switch(rand) {
          case 0:
            water = new Color(31, 199, 250);
            break;
          case 1:
            water = new Color(14, 85, 107);
            break;
          default:
            water = new Color(21, 136, 171);
         }

         int waterRGB = water.getRGB();
         img.setRGB(x, y, waterRGB);
       }
     }

     img = resize(img, 32, 32);

     //write image
     try{
       String fileName = "static/images/block/water" + String.valueOf(i) + "_block.png";
       f = new File(fileName);
       ImageIO.write(img, "png", f);
     }catch(IOException e){
       System.out.println("Error: " + e);
     }

     img = resize(img, 16, 16);
     //write image
     try{
       String fileName = "static/images/item/water" + String.valueOf(i) + "_item.png";
       f = new File(fileName);
       ImageIO.write(img, "png", f);
     }catch(IOException e){
       System.out.println("Error: " + e);
     }
  }
  /*============================================================================*/
  /*================================ STONE BLOCK ===============================*/
  /*============================================================================*/
     for (int i = 0; i < 10; i++) {
       //image dimension
       int width = 8;
       int height = 8;

       //create buffered image object img
       BufferedImage img = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
       //file object

       File f = null;
       Color stone;

       //create random image pixel by pixel
       for(int y = 0; y < height; y++){
         for(int x = 0; x < width; x++){

           int rand = (int)(Math.random()*6);

           switch(rand) {
            case 0:
              stone = new Color(78, 78, 78);
              break;
            case 1:
              stone = new Color(139, 139, 139);
              break;
            default:
              stone = new Color(117, 117, 117);
           }

           int stoneRGB = stone.getRGB();
           img.setRGB(x, y, stoneRGB);
         }
       }

       img = resize(img, 32, 32);

       //write image
       try{
         String fileName = "static/images/block/stone" + String.valueOf(i) + "_block.png";
         f = new File(fileName);
         ImageIO.write(img, "png", f);
       }catch(IOException e){
         System.out.println("Error: " + e);
       }

       img = resize(img, 16, 16);
       //write image
       try{
         String fileName = "static/images/item/stone" + String.valueOf(i) + "_item.png";
         f = new File(fileName);
         ImageIO.write(img, "png", f);
       }catch(IOException e){
         System.out.println("Error: " + e);
       }
    }

  }

  private static BufferedImage resize(BufferedImage img, int height, int width) {
        Image tmp = img.getScaledInstance(width, height, Image.SCALE_SMOOTH);
        BufferedImage resized = new BufferedImage(width, height, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g2d = resized.createGraphics();
        g2d.drawImage(tmp, 0, 0, null);
        g2d.dispose();
        return resized;
    }

}//class ends here
