import type { Building } from "../types";

const CITY_COORDINATES: Record<string, [number, number]> = {
  "Abu Dhabi, United Arab Emirates": [24.4539, 54.3773],"Beijing, China": [39.9042, 116.4074],"Busan, South Korea": [35.1796, 129.0756],"Cairo, Egypt": [30.0444, 31.2357],"Changsha, China": [28.2282, 112.9388],"Chicago, United States": [41.8781, -87.6298],"Chongqing, China": [29.563, 106.5516],"Dalian, China": [38.914, 121.6147],"Dongguan, China": [23.0207, 113.7518],"Dubai, United Arab Emirates": [25.2048, 55.2708],"Gold Coast, Australia": [-28.0167, 153.4],"Guangzhou, China": [23.1291, 113.2644],"Guiyang, China": [26.647, 106.6302],"Hanoi, Vietnam": [21.0278, 105.8342],"Ho Chi Minh City, Vietnam": [10.8231, 106.6297],"Hong Kong, Hong Kong": [22.3193, 114.1694],"Kuala Lumpur, Malaysia": [3.139, 101.6869],"Kunming, China": [25.0389, 102.7183],"Kuwait City, Kuwait": [29.3759, 47.9774],"Mecca, Saudi Arabia": [21.3891, 39.8579],"Moscow, Russia": [55.7558, 37.6173],"Nanjing, China": [32.0603, 118.7969],"Nanning, China": [22.817, 108.3669],"New York City, United States": [40.7128, -74.006],"Ningbo, China": [29.8683, 121.544],"Philadelphia, United States": [39.9526, -75.1652],"Qingdao, China": [36.0671, 120.3826],"Riyadh, Saudi Arabia": [24.7136, 46.6753],"San Francisco, United States": [37.7749, -122.4194],"Seoul, South Korea": [37.5665, 126.978],"Shanghai, China": [31.2304, 121.4737],"Shenyang, China": [41.8057, 123.4315],"Shenzhen, China": [22.5431, 114.0579],"St. Petersburg, Russia": [59.9311, 30.3609],"Suzhou, China": [31.2989, 120.5853],"Taipei, Taiwan": [25.033, 121.5654],"Tianjin, China": [39.0842, 117.2009],"Wuhan, China": [30.5928, 114.3055],"Wuxi, China": [31.4912, 120.3119],"Xi'an, China": [34.3416, 108.9398],"Xiamen, China": [24.4798, 118.0894],"Zhuhai, China": [22.2711, 113.5767],
};

export const RAW_DATA = `rank|name|city|country|completed|heightM|heightFt|floors|material|buildingFunction
1|Burj Khalifa|Dubai|United Arab Emirates|2010|828|2717|163|Steel Over Concrete|Office / Residential / Hotel
2|Merdeka 118|Kuala Lumpur|Malaysia|2023|679|2227|118|Concrete-Steel Composite|Hotel / Serviced Apartments / Office
3|Shanghai Tower|Shanghai|China|2015|632|2073|128|Concrete-Steel Composite|Hotel / Office
4|Makkah Royal Clock Tower|Mecca|Saudi Arabia|2012|601|1972|120|Steel Over Concrete|Serviced Apartments / Hotel / Retail
5|Ping An Finance Center|Shenzhen|China|2017|599|1965|115|Concrete-Steel Composite|Office
6|Lotte World Tower|Seoul|South Korea|2017|555|1819|123|Composite|Hotel / Office / Residential / Retail
7|One World Trade Center|New York City|United States|2014|541|1776|94|Composite|Office
8|Guangzhou CTF Finance Centre|Guangzhou|China|2016|530|1739|111|Concrete-Steel Composite|Hotel / Residential / Office
9|Tianjin CTF Finance Centre|Tianjin|China|2019|530|1739|97|Concrete-Steel Composite|Hotel / Serviced Apartments / Office
10|CITIC Tower|Beijing|China|2018|528|1731|109|Composite|Office
11|TAIPEI 101|Taipei|Taiwan|2004|508|1667|101|Composite|Office
12|Shanghai World Financial Center|Shanghai|China|2008|492|1614|101|Composite|Hotel / Office
13|International Commerce Centre|Hong Kong|Hong Kong|2010|484|1588|108|Composite|Hotel / Office
14|Wuhan Greenland Center|Wuhan|China|2023|476|1562|97|Composite|Hotel / Residential / Office
15|Central Park Tower|New York City|United States|2020|472|1550|98|Concrete|Residential / Retail
16|Lakhta Center|St. Petersburg|Russia|2019|462|1516|87|Composite|Office
17|Vincom Landmark 81|Ho Chi Minh City|Vietnam|2018|461|1513|81|Concrete|Hotel / Residential
18|Changsha IFS Tower T1|Changsha|China|2018|452|1483|94|Composite|Hotel / Office
19|Petronas Twin Tower 1|Kuala Lumpur|Malaysia|1998|452|1483|88|Composite|Office
20|Petronas Twin Tower 2|Kuala Lumpur|Malaysia|1998|452|1483|88|Composite|Office
21|Suzhou IFS|Suzhou|China|2019|450|1476|95|Composite|Hotel / Office / Serviced Apartments
22|Zifeng Tower|Nanjing|China|2010|450|1476|66|Composite|Hotel / Office / Retail
23|The Exchange 106|Kuala Lumpur|Malaysia|2019|446|1463|95|Concrete|Office
24|Willis Tower|Chicago|United States|1974|442|1451|108|Steel|Office
25|KK100|Shenzhen|China|2011|442|1449|100|Composite|Hotel / Office
26|Guangzhou International Finance Center|Guangzhou|China|2010|439|1439|103|Composite|Hotel / Office
27|Wuhan Center Tower|Wuhan|China|2019|438|1437|88|Composite|Hotel / Office / Residential
28|111 West 57th Street|New York City|United States|2021|435|1428|84|Concrete|Residential
29|One Vanderbilt Avenue|New York City|United States|2020|427|1401|62|Composite|Office
30|432 Park Avenue|New York City|United States|2015|426|1397|85|Concrete|Residential
31|Marina 101|Dubai|United Arab Emirates|2017|425|1394|101|Concrete|Hotel / Residential
32|Trump International Hotel & Tower|Chicago|United States|2009|423|1389|98|Concrete|Hotel / Residential
33|Dongguan International Trade Center 1|Dongguan|China|2022|423|1388|85|Composite|Office
34|Jin Mao Tower|Shanghai|China|1999|421|1380|88|Composite|Hotel / Office
35|Princess Tower|Dubai|United Arab Emirates|2012|414|1356|101|Concrete|Residential
36|Al Hamra Tower|Kuwait City|Kuwait|2011|413|1354|80|Concrete|Office
37|Two International Finance Centre|Hong Kong|Hong Kong|2003|412|1352|88|Composite|Office
38|Haeundae LCT The Sharp Landmark Tower|Busan|South Korea|2019|412|1350|101|Concrete|Hotel / Residential
39|Ningbo Center Tower 1|Ningbo|China|2021|409|1342|80|Composite|Office
40|Guangxi China Resources Tower|Nanning|China|2020|403|1321|86|Composite|Office
41|Guiyang International Financial Center T1|Guiyang|China|2020|401|1316|79|Composite|Hotel / Office
42|China Resources Tower|Shenzhen|China|2018|393|1289|68|Composite|Office
43|23 Marina|Dubai|United Arab Emirates|2012|393|1289|88|Concrete|Residential
44|CITIC Plaza|Guangzhou|China|1997|390|1280|80|Concrete|Office
45|30 Hudson Yards|New York City|United States|2019|387|1268|73|Composite|Office
46|Riyadh PIF Tower|Riyadh|Saudi Arabia|2021|385|1263|72|Composite|Office
47|Shun Hing Square|Shenzhen|China|1996|384|1260|69|Composite|Office
48|Eton Place Dalian Tower 1|Dalian|China|2015|383|1257|80|Composite|Hotel / Office / Residential
49|Nanning Logan Century 1|Nanning|China|2018|381|1251|82|Composite|Hotel / Office
50|Empire State Building|New York City|United States|1931|381|1250|102|Steel|Office`;

export function parseRawData(rawText: string, source: Building["recordSource"]): Building[] {
  return rawText.trim().split("\n").slice(1).map((line) => {
    const [rank, name, city, country, completedYear, heightM, heightFt, floors, material, functionLabel] = line.split("|");
    const location = `${city}, ${country}`;
    const [latitude, longitude] = CITY_COORDINATES[location] ?? [0, 0];
    return {
      id: `${rank}-${name}`,
      rank: Number(rank),
      name,
      city,
      country,
      completedYear: Number(completedYear),
      heightM: Number(heightM),
      heightFt: Number(heightFt),
      floors: Number(floors),
      material,
      functionLabel,
      primaryFunction: functionLabel.split("/")[0].trim(),
      latitude,
      longitude,
      coordinatePrecision: "city",
      recordSource: source,
    };
  });
}
