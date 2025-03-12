// app/utils/healthZones.ts
export type HealthZone = 
  | 'north-upper'  // เหนือบน
  | 'north-lower'  // เหนือล่าง
  | 'northeast-upper'  // อีสานบน
  | 'northeast-lower'  // อีสานล่าง
  | 'central'  // กลาง
  | 'east'  // ตะวันออก
  | 'west'  // ตะวันตก
  | 'south-upper'  // ใต้บน
  | 'south-lower'  // ใต้ล่าง
  | 'bangkok';  // กรุงเทพฯ

// จัดกลุ่มจังหวัดตามโซนสุขภาพ
export const provinceHealthZones: Record<string, HealthZone> = {
  // กรุงเทพฯ
  "กรุงเทพมหานคร": "bangkok",
  
  // เหนือบน
  "เชียงใหม่": "north-upper",
  "เชียงราย": "north-upper",
  "ลำปาง": "north-upper",
  "ลำพูน": "north-upper",
  "แม่ฮ่องสอน": "north-upper",
  "น่าน": "north-upper",
  "พะเยา": "north-upper",
  "แพร่": "north-upper",
  
  // เหนือล่าง
  "นครสวรรค์": "north-lower",
  "อุทัยธานี": "north-lower",
  "กำแพงเพชร": "north-lower",
  "ตาก": "north-lower",
  "สุโขทัย": "north-lower",
  "พิษณุโลก": "north-lower",
  "พิจิตร": "north-lower",
  "เพชรบูรณ์": "north-lower",
  "อุตรดิตถ์": "north-lower",
  
  // อีสานบน
  "ขอนแก่น": "northeast-upper",
  "อุดรธานี": "northeast-upper",
  "เลย": "northeast-upper",
  "หนองคาย": "northeast-upper",
  "หนองบัวลำภู": "northeast-upper",
  "บึงกาฬ": "northeast-upper",
  "นครพนม": "northeast-upper",
  "มุกดาหาร": "northeast-upper",
  "สกลนคร": "northeast-upper",
  "กาฬสินธุ์": "northeast-upper",
  "ร้อยเอ็ด": "northeast-upper",
  "มหาสารคาม": "northeast-upper",
  
  // อีสานล่าง
  "นครราชสีมา": "northeast-lower",
  "ชัยภูมิ": "northeast-lower",
  "บุรีรัมย์": "northeast-lower",
  "สุรินทร์": "northeast-lower",
  "ศรีสะเกษ": "northeast-lower",
  "อุบลราชธานี": "northeast-lower",
  "ยโสธร": "northeast-lower",
  "อำนาจเจริญ": "northeast-lower",
  
  // กลาง
  "ลพบุรี": "central",
  "สิงห์บุรี": "central",
  "ชัยนาท": "central",
  "อ่างทอง": "central",
  "พระนครศรีอยุธยา": "central",
  "สระบุรี": "central",
  "ปทุมธานี": "central",
  "นนทบุรี": "central",
  
  // ตะวันออก
  "สมุทรปราการ": "east",
  "ฉะเชิงเทรา": "east",
  "นครนายก": "east",
  "ปราจีนบุรี": "east",
  "สระแก้ว": "east",
  "จันทบุรี": "east",
  "ตราด": "east",
  "ระยอง": "east",
  "ชลบุรี": "east",
  
  // ตะวันตก
  "สมุทรสงคราม": "west",
  "สมุทรสาคร": "west",
  "นครปฐม": "west",
  "กาญจนบุรี": "west",
  "ราชบุรี": "west",
  "สุพรรณบุรี": "west",
  "เพชรบุรี": "west",
  "ประจวบคีรีขันธ์": "west",
  
  // ใต้บน
  "ชุมพร": "south-upper",
  "ระนอง": "south-upper",
  "สุราษฎร์ธานี": "south-upper",
  "พังงา": "south-upper",
  "ภูเก็ต": "south-upper",
  "กระบี่": "south-upper",
  "นครศรีธรรมราช": "south-upper",
  
  // ใต้ล่าง
  "ตรัง": "south-lower",
  "พัทลุง": "south-lower",
  "สตูล": "south-lower",
  "สงขลา": "south-lower",
  "ปัตตานี": "south-lower",
  "ยะลา": "south-lower",
  "นราธิวาส": "south-lower"
};

// ฟังก์ชันดึงโซนจากชื่อจังหวัด
export function getProvinceHealthZone(provinceName: string): HealthZone {
  // ถ้าไม่พบจังหวัดในรายการ ให้ถือเป็น central (กลาง)
  return provinceHealthZones[provinceName] || "central";
}

// ฟังก์ชันแปลงรหัสโซนเป็นชื่อภาษาไทย
export function getThaiZoneName(zoneCode: HealthZone): string {
  const zoneNames: Record<HealthZone, string> = {
    "north-upper": "เหนือบน",
    "north-lower": "เหนือล่าง",
    "northeast-upper": "อีสานบน",
    "northeast-lower": "อีสานล่าง",
    "central": "กลาง",
    "east": "ตะวันออก",
    "west": "ตะวันตก",
    "south-upper": "ใต้บน",
    "south-lower": "ใต้ล่าง",
    "bangkok": "กรุงเทพฯ"
  };
  
  return zoneNames[zoneCode];
}