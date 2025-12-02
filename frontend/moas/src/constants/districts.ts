// // src/constants/districts.ts

// /**
//  * 대한민국 행정구역 코드 (법정동 코드)
//  * 백엔드 API와 매핑되는 지역 코드 목록
//  */

// export interface DistrictInfo {
//   code: string;
//   province: string;
//   district: string;
//   fullName: string;
// }

// /**
//  * 지역 코드를 province와 district로 매핑
//  */
// export const DISTRICT_CODES: Record<string, DistrictInfo> = {
//   // 서울특별시
//   '1111000000': { code: '1111000000', province: '서울특별시', district: '종로구', fullName: '서울특별시 종로구' },
//   '1114000000': { code: '1114000000', province: '서울특별시', district: '중구', fullName: '서울특별시 중구' },
//   '1117000000': { code: '1117000000', province: '서울특별시', district: '용산구', fullName: '서울특별시 용산구' },
//   '1120000000': { code: '1120000000', province: '서울특별시', district: '성동구', fullName: '서울특별시 성동구' },
//   '1121500000': { code: '1121500000', province: '서울특별시', district: '광진구', fullName: '서울특별시 광진구' },
//   '1123000000': { code: '1123000000', province: '서울특별시', district: '동대문구', fullName: '서울특별시 동대문구' },
//   '1126000000': { code: '1126000000', province: '서울특별시', district: '중랑구', fullName: '서울특별시 중랑구' },
//   '1129000000': { code: '1129000000', province: '서울특별시', district: '성북구', fullName: '서울특별시 성북구' },
//   '1130500000': { code: '1130500000', province: '서울특별시', district: '강북구', fullName: '서울특별시 강북구' },
//   '1132000000': { code: '1132000000', province: '서울특별시', district: '도봉구', fullName: '서울특별시 도봉구' },
//   '1135000000': { code: '1135000000', province: '서울특별시', district: '노원구', fullName: '서울특별시 노원구' },
//   '1138000000': { code: '1138000000', province: '서울특별시', district: '은평구', fullName: '서울특별시 은평구' },
//   '1141000000': { code: '1141000000', province: '서울특별시', district: '서대문구', fullName: '서울특별시 서대문구' },
//   '1144000000': { code: '1144000000', province: '서울특별시', district: '마포구', fullName: '서울특별시 마포구' },
//   '1147000000': { code: '1147000000', province: '서울특별시', district: '양천구', fullName: '서울특별시 양천구' },
//   '1150000000': { code: '1150000000', province: '서울특별시', district: '강서구', fullName: '서울특별시 강서구' },
//   '1153000000': { code: '1153000000', province: '서울특별시', district: '구로구', fullName: '서울특별시 구로구' },
//   '1154500000': { code: '1154500000', province: '서울특별시', district: '금천구', fullName: '서울특별시 금천구' },
//   '1156000000': { code: '1156000000', province: '서울특별시', district: '영등포구', fullName: '서울특별시 영등포구' },
//   '1159000000': { code: '1159000000', province: '서울특별시', district: '동작구', fullName: '서울특별시 동작구' },
//   '1162000000': { code: '1162000000', province: '서울특별시', district: '관악구', fullName: '서울특별시 관악구' },
//   '1165000000': { code: '1165000000', province: '서울특별시', district: '서초구', fullName: '서울특별시 서초구' },
//   '1168000000': { code: '1168000000', province: '서울특별시', district: '강남구', fullName: '서울특별시 강남구' },
//   '1171000000': { code: '1171000000', province: '서울특별시', district: '송파구', fullName: '서울특별시 송파구' },
//   '1174000000': { code: '1174000000', province: '서울특별시', district: '강동구', fullName: '서울특별시 강동구' },

//   // 부산광역시
//   '2611000000': { code: '2611000000', province: '부산광역시', district: '중구', fullName: '부산광역시 중구' },
//   '2614000000': { code: '2614000000', province: '부산광역시', district: '서구', fullName: '부산광역시 서구' },
//   '2617000000': { code: '2617000000', province: '부산광역시', district: '동구', fullName: '부산광역시 동구' },
//   '2620000000': { code: '2620000000', province: '부산광역시', district: '영도구', fullName: '부산광역시 영도구' },
//   '2623000000': { code: '2623000000', province: '부산광역시', district: '부산진구', fullName: '부산광역시 부산진구' },
//   '2626000000': { code: '2626000000', province: '부산광역시', district: '동래구', fullName: '부산광역시 동래구' },
//   '2629000000': { code: '2629000000', province: '부산광역시', district: '남구', fullName: '부산광역시 남구' },
//   '2632000000': { code: '2632000000', province: '부산광역시', district: '북구', fullName: '부산광역시 북구' },
//   '2635000000': { code: '2635000000', province: '부산광역시', district: '해운대구', fullName: '부산광역시 해운대구' },
//   '2638000000': { code: '2638000000', province: '부산광역시', district: '사하구', fullName: '부산광역시 사하구' },
//   '2641000000': { code: '2641000000', province: '부산광역시', district: '금정구', fullName: '부산광역시 금정구' },
//   '2644000000': { code: '2644000000', province: '부산광역시', district: '강서구', fullName: '부산광역시 강서구' },
//   '2647000000': { code: '2647000000', province: '부산광역시', district: '연제구', fullName: '부산광역시 연제구' },
//   '2650000000': { code: '2650000000', province: '부산광역시', district: '수영구', fullName: '부산광역시 수영구' },
//   '2653000000': { code: '2653000000', province: '부산광역시', district: '사상구', fullName: '부산광역시 사상구' },
//   '2671000000': { code: '2671000000', province: '부산광역시', district: '기장군', fullName: '부산광역시 기장군' },

//   // 대구광역시
//   '2711000000': { code: '2711000000', province: '대구광역시', district: '중구', fullName: '대구광역시 중구' },
//   '2714000000': { code: '2714000000', province: '대구광역시', district: '동구', fullName: '대구광역시 동구' },
//   '2717000000': { code: '2717000000', province: '대구광역시', district: '서구', fullName: '대구광역시 서구' },
//   '2720000000': { code: '2720000000', province: '대구광역시', district: '남구', fullName: '대구광역시 남구' },
//   '2723000000': { code: '2723000000', province: '대구광역시', district: '북구', fullName: '대구광역시 북구' },
//   '2726000000': { code: '2726000000', province: '대구광역시', district: '수성구', fullName: '대구광역시 수성구' },
//   '2729000000': { code: '2729000000', province: '대구광역시', district: '달서구', fullName: '대구광역시 달서구' },
//   '2771000000': { code: '2771000000', province: '대구광역시', district: '달성군', fullName: '대구광역시 달성군' },
//   '2772000000': { code: '2772000000', province: '대구광역시', district: '군위군', fullName: '대구광역시 군위군' },

//   // 인천광역시
//   '2811000000': { code: '2811000000', province: '인천광역시', district: '중구', fullName: '인천광역시 중구' },
//   '2814000000': { code: '2814000000', province: '인천광역시', district: '동구', fullName: '인천광역시 동구' },
//   '2817700000': { code: '2817700000', province: '인천광역시', district: '미추홀구', fullName: '인천광역시 미추홀구' },
//   '2818500000': { code: '2818500000', province: '인천광역시', district: '연수구', fullName: '인천광역시 연수구' },
//   '2820000000': { code: '2820000000', province: '인천광역시', district: '남동구', fullName: '인천광역시 남동구' },
//   '2823700000': { code: '2823700000', province: '인천광역시', district: '부평구', fullName: '인천광역시 부평구' },
//   '2824500000': { code: '2824500000', province: '인천광역시', district: '계양구', fullName: '인천광역시 계양구' },
//   '2826000000': { code: '2826000000', province: '인천광역시', district: '서구', fullName: '인천광역시 서구' },
//   '2871000000': { code: '2871000000', province: '인천광역시', district: '강화군', fullName: '인천광역시 강화군' },
//   '2872000000': { code: '2872000000', province: '인천광역시', district: '옹진군', fullName: '인천광역시 옹진군' },

//   // 광주광역시
//   '2911000000': { code: '2911000000', province: '광주광역시', district: '동구', fullName: '광주광역시 동구' },
//   '2914000000': { code: '2914000000', province: '광주광역시', district: '서구', fullName: '광주광역시 서구' },
//   '2915500000': { code: '2915500000', province: '광주광역시', district: '남구', fullName: '광주광역시 남구' },
//   '2917000000': { code: '2917000000', province: '광주광역시', district: '북구', fullName: '광주광역시 북구' },
//   '2920000000': { code: '2920000000', province: '광주광역시', district: '광산구', fullName: '광주광역시 광산구' },

//   // 대전광역시
//   '3011000000': { code: '3011000000', province: '대전광역시', district: '동구', fullName: '대전광역시 동구' },
//   '3014000000': { code: '3014000000', province: '대전광역시', district: '중구', fullName: '대전광역시 중구' },
//   '3017000000': { code: '3017000000', province: '대전광역시', district: '서구', fullName: '대전광역시 서구' },
//   '3020000000': { code: '3020000000', province: '대전광역시', district: '유성구', fullName: '대전광역시 유성구' },
//   '3023000000': { code: '3023000000', province: '대전광역시', district: '대덕구', fullName: '대전광역시 대덕구' },

//   // 울산광역시
//   '3111000000': { code: '3111000000', province: '울산광역시', district: '중구', fullName: '울산광역시 중구' },
//   '3114000000': { code: '3114000000', province: '울산광역시', district: '남구', fullName: '울산광역시 남구' },
//   '3117000000': { code: '3117000000', province: '울산광역시', district: '동구', fullName: '울산광역시 동구' },
//   '3120000000': { code: '3120000000', province: '울산광역시', district: '북구', fullName: '울산광역시 북구' },
//   '3171000000': { code: '3171000000', province: '울산광역시', district: '울주군', fullName: '울산광역시 울주군' },

//   // 세종특별자치시
//   '3611000000': { code: '3611000000', province: '세종특별자치시', district: '세종시', fullName: '세종특별자치시' },

//   // 경기도 (일부만 포함, 필요시 추가)
//   '4111000000': { code: '4111000000', province: '경기도', district: '수원시', fullName: '경기도 수원시' },
//   '4113000000': { code: '4113000000', province: '경기도', district: '성남시', fullName: '경기도 성남시' },
//   '4115000000': { code: '4115000000', province: '경기도', district: '의정부시', fullName: '경기도 의정부시' },
//   '4117000000': { code: '4117000000', province: '경기도', district: '안양시', fullName: '경기도 안양시' },
//   '4119000000': { code: '4119000000', province: '경기도', district: '부천시', fullName: '경기도 부천시' },
//   '4121000000': { code: '4121000000', province: '경기도', district: '광명시', fullName: '경기도 광명시' },
//   '4122000000': { code: '4122000000', province: '경기도', district: '평택시', fullName: '경기도 평택시' },
//   '4125000000': { code: '4125000000', province: '경기도', district: '동두천시', fullName: '경기도 동두천시' },
//   '4127000000': { code: '4127000000', province: '경기도', district: '안산시', fullName: '경기도 안산시' },
//   '4128000000': { code: '4128000000', province: '경기도', district: '고양시', fullName: '경기도 고양시' },
//   '4129000000': { code: '4129000000', province: '경기도', district: '과천시', fullName: '경기도 과천시' },
//   '4131000000': { code: '4131000000', province: '경기도', district: '구리시', fullName: '경기도 구리시' },
//   '4136000000': { code: '4136000000', province: '경기도', district: '남양주시', fullName: '경기도 남양주시' },
//   '4137000000': { code: '4137000000', province: '경기도', district: '오산시', fullName: '경기도 오산시' },
//   '4139000000': { code: '4139000000', province: '경기도', district: '시흥시', fullName: '경기도 시흥시' },
//   '4141000000': { code: '4141000000', province: '경기도', district: '군포시', fullName: '경기도 군포시' },
//   '4143000000': { code: '4143000000', province: '경기도', district: '의왕시', fullName: '경기도 의왕시' },
//   '4145000000': { code: '4145000000', province: '경기도', district: '하남시', fullName: '경기도 하남시' },
//   '4146000000': { code: '4146000000', province: '경기도', district: '용인시', fullName: '경기도 용인시' },
//   '4148000000': { code: '4148000000', province: '경기도', district: '파주시', fullName: '경기도 파주시' },
//   '4150000000': { code: '4150000000', province: '경기도', district: '이천시', fullName: '경기도 이천시' },
//   '4155000000': { code: '4155000000', province: '경기도', district: '안성시', fullName: '경기도 안성시' },
//   '4157000000': { code: '4157000000', province: '경기도', district: '김포시', fullName: '경기도 김포시' },
//   '4159000000': { code: '4159000000', province: '경기도', district: '화성시', fullName: '경기도 화성시' },
//   '4161000000': { code: '4161000000', province: '경기도', district: '광주시', fullName: '경기도 광주시' },
//   '4163000000': { code: '4163000000', province: '경기도', district: '양주시', fullName: '경기도 양주시' },
//   '4165000000': { code: '4165000000', province: '경기도', district: '포천시', fullName: '경기도 포천시' },
//   '4167000000': { code: '4167000000', province: '경기도', district: '여주시', fullName: '경기도 여주시' },
//   '4180000000': { code: '4180000000', province: '경기도', district: '연천군', fullName: '경기도 연천군' },
//   '4182000000': { code: '4182000000', province: '경기도', district: '가평군', fullName: '경기도 가평군' },
//   '4183000000': { code: '4183000000', province: '경기도', district: '양평군', fullName: '경기도 양평군' },

//   // 강원특별자치도
//   '5111000000': { code: '5111000000', province: '강원특별자치도', district: '춘천시', fullName: '강원특별자치도 춘천시' },
//   '5113000000': { code: '5113000000', province: '강원특별자치도', district: '원주시', fullName: '강원특별자치도 원주시' },
//   '5115000000': { code: '5115000000', province: '강원특별자치도', district: '강릉시', fullName: '강원특별자치도 강릉시' },
//   '5117000000': { code: '5117000000', province: '강원특별자치도', district: '동해시', fullName: '강원특별자치도 동해시' },
//   '5119000000': { code: '5119000000', province: '강원특별자치도', district: '태백시', fullName: '강원특별자치도 태백시' },
//   '5121000000': { code: '5121000000', province: '강원특별자치도', district: '속초시', fullName: '강원특별자치도 속초시' },
//   '5123000000': { code: '5123000000', province: '강원특별자치도', district: '삼척시', fullName: '강원특별자치도 삼척시' },
//   '5172000000': { code: '5172000000', province: '강원특별자치도', district: '홍천군', fullName: '강원특별자치도 홍천군' },
//   '5173000000': { code: '5173000000', province: '강원특별자치도', district: '횡성군', fullName: '강원특별자치도 횡성군' },
//   '5175000000': { code: '5175000000', province: '강원특별자치도', district: '영월군', fullName: '강원특별자치도 영월군' },
//   '5176000000': { code: '5176000000', province: '강원특별자치도', district: '평창군', fullName: '강원특별자치도 평창군' },
//   '5177000000': { code: '5177000000', province: '강원특별자치도', district: '정선군', fullName: '강원특별자치도 정선군' },
//   '5178000000': { code: '5178000000', province: '강원특별자치도', district: '철원군', fullName: '강원특별자치도 철원군' },
//   '5179000000': { code: '5179000000', province: '강원특별자치도', district: '화천군', fullName: '강원특별자치도 화천군' },
//   '5180000000': { code: '5180000000', province: '강원특별자치도', district: '양구군', fullName: '강원특별자치도 양구군' },
//   '5181000000': { code: '5181000000', province: '강원특별자치도', district: '인제군', fullName: '강원특별자치도 인제군' },
//   '5182000000': { code: '5182000000', province: '강원특별자치도', district: '고성군', fullName: '강원특별자치도 고성군' },
//   '5183000000': { code: '5183000000', province: '강원특별자치도', district: '양양군', fullName: '강원특별자치도 양양군' },

//   // 충청북도
//   '4311000000': { code: '4311000000', province: '충청북도', district: '청주시', fullName: '충청북도 청주시' },
//   '4313000000': { code: '4313000000', province: '충청북도', district: '충주시', fullName: '충청북도 충주시' },
//   '4315000000': { code: '4315000000', province: '충청북도', district: '제천시', fullName: '충청북도 제천시' },
//   '4372000000': { code: '4372000000', province: '충청북도', district: '보은군', fullName: '충청북도 보은군' },
//   '4373000000': { code: '4373000000', province: '충청북도', district: '옥천군', fullName: '충청북도 옥천군' },
//   '4374000000': { code: '4374000000', province: '충청북도', district: '영동군', fullName: '충청북도 영동군' },
//   '4374500000': { code: '4374500000', province: '충청북도', district: '증평군', fullName: '충청북도 증평군' },
//   '4375000000': { code: '4375000000', province: '충청북도', district: '진천군', fullName: '충청북도 진천군' },
//   '4376000000': { code: '4376000000', province: '충청북도', district: '괴산군', fullName: '충청북도 괴산군' },
//   '4377000000': { code: '4377000000', province: '충청북도', district: '음성군', fullName: '충청북도 음성군' },
//   '4380000000': { code: '4380000000', province: '충청북도', district: '단양군', fullName: '충청북도 단양군' },

//   // 충청남도
//   '4413000000': { code: '4413000000', province: '충청남도', district: '천안시', fullName: '충청남도 천안시' },
//   '4415000000': { code: '4415000000', province: '충청남도', district: '공주시', fullName: '충청남도 공주시' },
//   '4418000000': { code: '4418000000', province: '충청남도', district: '보령시', fullName: '충청남도 보령시' },
//   '4420000000': { code: '4420000000', province: '충청남도', district: '아산시', fullName: '충청남도 아산시' },
//   '4421000000': { code: '4421000000', province: '충청남도', district: '서산시', fullName: '충청남도 서산시' },
//   '4423000000': { code: '4423000000', province: '충청남도', district: '논산시', fullName: '충청남도 논산시' },
//   '4425000000': { code: '4425000000', province: '충청남도', district: '계룡시', fullName: '충청남도 계룡시' },
//   '4427000000': { code: '4427000000', province: '충청남도', district: '당진시', fullName: '충청남도 당진시' },
//   '4471000000': { code: '4471000000', province: '충청남도', district: '금산군', fullName: '충청남도 금산군' },
//   '4476000000': { code: '4476000000', province: '충청남도', district: '부여군', fullName: '충청남도 부여군' },
//   '4477000000': { code: '4477000000', province: '충청남도', district: '서천군', fullName: '충청남도 서천군' },
//   '4479000000': { code: '4479000000', province: '충청남도', district: '청양군', fullName: '충청남도 청양군' },
//   '4480000000': { code: '4480000000', province: '충청남도', district: '홍성군', fullName: '충청남도 홍성군' },
//   '4481000000': { code: '4481000000', province: '충청남도', district: '예산군', fullName: '충청남도 예산군' },
//   '4482500000': { code: '4482500000', province: '충청남도', district: '태안군', fullName: '충청남도 태안군' },

//   // 전북특별자치도
//   '5211000000': { code: '5211000000', province: '전북특별자치도', district: '전주시', fullName: '전북특별자치도 전주시' },
//   '5213000000': { code: '5213000000', province: '전북특별자치도', district: '군산시', fullName: '전북특별자치도 군산시' },
//   '5214000000': { code: '5214000000', province: '전북특별자치도', district: '익산시', fullName: '전북특별자치도 익산시' },
//   '5218000000': { code: '5218000000', province: '전북특별자치도', district: '정읍시', fullName: '전북특별자치도 정읍시' },
//   '5219000000': { code: '5219000000', province: '전북특별자치도', district: '남원시', fullName: '전북특별자치도 남원시' },
//   '5221000000': { code: '5221000000', province: '전북특별자치도', district: '김제시', fullName: '전북특별자치도 김제시' },
//   '5271000000': { code: '5271000000', province: '전북특별자치도', district: '완주군', fullName: '전북특별자치도 완주군' },
//   '5272000000': { code: '5272000000', province: '전북특별자치도', district: '진안군', fullName: '전북특별자치도 진안군' },
//   '5273000000': { code: '5273000000', province: '전북특별자치도', district: '무주군', fullName: '전북특별자치도 무주군' },
//   '5274000000': { code: '5274000000', province: '전북특별자치도', district: '장수군', fullName: '전북특별자치도 장수군' },
//   '5275000000': { code: '5275000000', province: '전북특별자치도', district: '임실군', fullName: '전북특별자치도 임실군' },
//   '5277000000': { code: '5277000000', province: '전북특별자치도', district: '순창군', fullName: '전북특별자치도 순창군' },
//   '5279000000': { code: '5279000000', province: '전북특별자치도', district: '고창군', fullName: '전북특별자치도 고창군' },
//   '5280000000': { code: '5280000000', province: '전북특별자치도', district: '부안군', fullName: '전북특별자치도 부안군' },

//   // 전라남도
//   '4611000000': { code: '4611000000', province: '전라남도', district: '목포시', fullName: '전라남도 목포시' },
//   '4613000000': { code: '4613000000', province: '전라남도', district: '여수시', fullName: '전라남도 여수시' },
//   '4615000000': { code: '4615000000', province: '전라남도', district: '순천시', fullName: '전라남도 순천시' },
//   '4617000000': { code: '4617000000', province: '전라남도', district: '나주시', fullName: '전라남도 나주시' },
//   '4623000000': { code: '4623000000', province: '전라남도', district: '광양시', fullName: '전라남도 광양시' },
//   '4671000000': { code: '4671000000', province: '전라남도', district: '담양군', fullName: '전라남도 담양군' },
//   '4672000000': { code: '4672000000', province: '전라남도', district: '곡성군', fullName: '전라남도 곡성군' },
//   '4673000000': { code: '4673000000', province: '전라남도', district: '구례군', fullName: '전라남도 구례군' },
//   '4677000000': { code: '4677000000', province: '전라남도', district: '고흥군', fullName: '전라남도 고흥군' },
//   '4678000000': { code: '4678000000', province: '전라남도', district: '보성군', fullName: '전라남도 보성군' },
//   '4679000000': { code: '4679000000', province: '전라남도', district: '화순군', fullName: '전라남도 화순군' },
//   '4680000000': { code: '4680000000', province: '전라남도', district: '장흥군', fullName: '전라남도 장흥군' },
//   '4681000000': { code: '4681000000', province: '전라남도', district: '강진군', fullName: '전라남도 강진군' },
//   '4682000000': { code: '4682000000', province: '전라남도', district: '해남군', fullName: '전라남도 해남군' },
//   '4683000000': { code: '4683000000', province: '전라남도', district: '영암군', fullName: '전라남도 영암군' },
//   '4684000000': { code: '4684000000', province: '전라남도', district: '무안군', fullName: '전라남도 무안군' },
//   '4686000000': { code: '4686000000', province: '전라남도', district: '함평군', fullName: '전라남도 함평군' },
//   '4687000000': { code: '4687000000', province: '전라남도', district: '영광군', fullName: '전라남도 영광군' },
//   '4688000000': { code: '4688000000', province: '전라남도', district: '장성군', fullName: '전라남도 장성군' },
//   '4689000000': { code: '4689000000', province: '전라남도', district: '완도군', fullName: '전라남도 완도군' },
//   '4690000000': { code: '4690000000', province: '전라남도', district: '진도군', fullName: '전라남도 진도군' },
//   '4691000000': { code: '4691000000', province: '전라남도', district: '신안군', fullName: '전라남도 신안군' },

//   // 경상북도
//   '4711000000': { code: '4711000000', province: '경상북도', district: '포항시', fullName: '경상북도 포항시' },
//   '4713000000': { code: '4713000000', province: '경상북도', district: '경주시', fullName: '경상북도 경주시' },
//   '4715000000': { code: '4715000000', province: '경상북도', district: '김천시', fullName: '경상북도 김천시' },
//   '4717000000': { code: '4717000000', province: '경상북도', district: '안동시', fullName: '경상북도 안동시' },
//   '4719000000': { code: '4719000000', province: '경상북도', district: '구미시', fullName: '경상북도 구미시' },
//   '4721000000': { code: '4721000000', province: '경상북도', district: '영주시', fullName: '경상북도 영주시' },
//   '4723000000': { code: '4723000000', province: '경상북도', district: '영천시', fullName: '경상북도 영천시' },
//   '4725000000': { code: '4725000000', province: '경상북도', district: '상주시', fullName: '경상북도 상주시' },
//   '4728000000': { code: '4728000000', province: '경상북도', district: '문경시', fullName: '경상북도 문경시' },
//   '4729000000': { code: '4729000000', province: '경상북도', district: '경산시', fullName: '경상북도 경산시' },
//   '4773000000': { code: '4773000000', province: '경상북도', district: '의성군', fullName: '경상북도 의성군' },
//   '4775000000': { code: '4775000000', province: '경상북도', district: '청송군', fullName: '경상북도 청송군' },
//   '4776000000': { code: '4776000000', province: '경상북도', district: '영양군', fullName: '경상북도 영양군' },
//   '4777000000': { code: '4777000000', province: '경상북도', district: '영덕군', fullName: '경상북도 영덕군' },
//   '4782000000': { code: '4782000000', province: '경상북도', district: '청도군', fullName: '경상북도 청도군' },
//   '4783000000': { code: '4783000000', province: '경상북도', district: '고령군', fullName: '경상북도 고령군' },
//   '4784000000': { code: '4784000000', province: '경상북도', district: '성주군', fullName: '경상북도 성주군' },
//   '4785000000': { code: '4785000000', province: '경상북도', district: '칠곡군', fullName: '경상북도 칠곡군' },
//   '4790000000': { code: '4790000000', province: '경상북도', district: '예천군', fullName: '경상북도 예천군' },
//   '4792000000': { code: '4792000000', province: '경상북도', district: '봉화군', fullName: '경상북도 봉화군' },
//   '4793000000': { code: '4793000000', province: '경상북도', district: '울진군', fullName: '경상북도 울진군' },
//   '4794000000': { code: '4794000000', province: '경상북도', district: '울릉군', fullName: '경상북도 울릉군' },

//   // 경상남도
//   '4812000000': { code: '4812000000', province: '경상남도', district: '창원시', fullName: '경상남도 창원시' },
//   '4817000000': { code: '4817000000', province: '경상남도', district: '진주시', fullName: '경상남도 진주시' },
//   '4822000000': { code: '4822000000', province: '경상남도', district: '통영시', fullName: '경상남도 통영시' },
//   '4824000000': { code: '4824000000', province: '경상남도', district: '사천시', fullName: '경상남도 사천시' },
//   '4825000000': { code: '4825000000', province: '경상남도', district: '김해시', fullName: '경상남도 김해시' },
//   '4827000000': { code: '4827000000', province: '경상남도', district: '밀양시', fullName: '경상남도 밀양시' },
//   '4831000000': { code: '4831000000', province: '경상남도', district: '거제시', fullName: '경상남도 거제시' },
//   '4833000000': { code: '4833000000', province: '경상남도', district: '양산시', fullName: '경상남도 양산시' },
//   '4872000000': { code: '4872000000', province: '경상남도', district: '의령군', fullName: '경상남도 의령군' },
//   '4873000000': { code: '4873000000', province: '경상남도', district: '함안군', fullName: '경상남도 함안군' },
//   '4874000000': { code: '4874000000', province: '경상남도', district: '창녕군', fullName: '경상남도 창녕군' },
//   '4882000000': { code: '4882000000', province: '경상남도', district: '고성군', fullName: '경상남도 고성군' },
//   '4884000000': { code: '4884000000', province: '경상남도', district: '남해군', fullName: '경상남도 남해군' },
//   '4885000000': { code: '4885000000', province: '경상남도', district: '하동군', fullName: '경상남도 하동군' },
//   '4886000000': { code: '4886000000', province: '경상남도', district: '산청군', fullName: '경상남도 산청군' },
//   '4887000000': { code: '4887000000', province: '경상남도', district: '함양군', fullName: '경상남도 함양군' },
//   '4888000000': { code: '4888000000', province: '경상남도', district: '거창군', fullName: '경상남도 거창군' },
//   '4889000000': { code: '4889000000', province: '경상남도', district: '합천군', fullName: '경상남도 합천군' },

//   // 제주특별자치도
//   '5011000000': { code: '5011000000', province: '제주특별자치도', district: '제주시', fullName: '제주특별자치도 제주시' },
//   '5013000000': { code: '5013000000', province: '제주특별자치도', district: '서귀포시', fullName: '제주특별자치도 서귀포시' },
// } as const;

// /**
//  * 지역 코드로 지역 정보 조회
//  */
// export const getDistrictInfo = (code: string): DistrictInfo | undefined => {
//   return DISTRICT_CODES[code];
// };

// /**
//  * 시/도와 구/군으로 지역 코드 조회
//  */
// export const getDistrictCode = (province: string, district: string): string | undefined => {
//   const entry = Object.entries(DISTRICT_CODES).find(
//     ([_, info]) => info.province === province && info.district === district
//   );
//   return entry ? entry[0] : undefined;
// };

// /**
//  * 시/도별로 구/군 목록 반환
//  */
// export const getDistrictsByProvince = (province: string): DistrictInfo[] => {
//   return Object.values(DISTRICT_CODES).filter(info => info.province === province);
// };

// /**
//  * 모든 시/도 목록 반환
//  */
// export const getProvinces = (): string[] => {
//   const provinces = new Set(Object.values(DISTRICT_CODES).map(info => info.province));
//   return Array.from(provinces);
// };
