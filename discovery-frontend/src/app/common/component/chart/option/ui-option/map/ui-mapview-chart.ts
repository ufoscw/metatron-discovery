/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { UIOption } from '../../ui-option';
import { UILayers } from './ui-layers';

/**
 * 맵뷰 화면 UI에 필요한 옵션
 * Version 2.0
 */
export interface UIMapViewChart extends UIOption {

  ////////////////////////////////////////////
  // 서버 스펙
  ////////////////////////////////////////////

  // 맵 보이기 여부
  showMapLayer?: boolean;

  // 기본지도 종류
  map?: string;

  // 라이선스 표기
  licenseNotation?: string;

  // 지역레이어 표시 여부
  showDistrictLayer?: boolean;

  // 지역 단위
  districtUnit?: string;

  // 레이어 속성
  layers?: UILayers[];

  ////////////////////////////////////////////
  // UI 스펙
  ////////////////////////////////////////////

}
