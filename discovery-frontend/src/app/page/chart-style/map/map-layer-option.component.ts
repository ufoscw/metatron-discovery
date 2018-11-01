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

import {
  Component,
  ElementRef,
  Injector,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild
} from '@angular/core';
import * as _ from 'lodash';
import {
  ColorRange,
  UIChartColorBySeries,
  UIChartColorByValue,
  UIOption
} from '../../../common/component/chart/option/ui-option';
import { ChartColorList, ColorCustomMode, ColorRangeType } from '../../../common/component/chart/option/define/common';
import { Pivot } from '../../../domain/workbook/configurations/pivot';
import { BaseOptionComponent } from '../base-option.component';
import { DatasourceService } from '../../../datasource/service/datasource.service';
import { FormatOptionConverter } from '../../../common/component/chart/option/converter/format-option-converter';

import { OptionGenerator } from '../../../common/component/chart/option/util/option-generator';
import { UIHeatmapLayer } from '../../../common/component/chart/option/ui-option/map/ui-heatmap-layer';
import { LogicalType } from '../../../domain/datasource/datasource';
import UI = OptionGenerator.UI;

@Component({
  selector: 'map-layer-option',
  templateUrl: './map-layer-option.component.html'
})

export class MapLayerOptionComponent extends BaseOptionComponent implements OnInit, OnDestroy {

  // series, dimension 색상 리스트
  public defaultColorList: Object[] = [
    { index: 1, colorNum: 'SC1' },
    { index: 2, colorNum: 'SC2' },
    { index: 3, colorNum: 'SC3' },
    { index: 4, colorNum: 'SC4' },
    { index: 5, colorNum: 'SC5' },
    { index: 6, colorNum: 'SC6' },
    { index: 7, colorNum: 'SC7' },
    { index: 8, colorNum: 'SC8' },
    { index: 9, colorNum: 'SC9' }
  ];

  public measureColorList: Object[] = [
    { index: 1, colorNum: 'VC1' },
    { index: 2, colorNum: 'VC2' },
    { index: 3, colorNum: 'VC3' },
    { index: 4, colorNum: 'VC4' },
    { index: 5, colorNum: 'VC5' },
    { index: 6, colorNum: 'VC6' },
    { index: 7, colorNum: 'VC7' }
  ];

  // measure 반전(value) 색상 리스트
  public measureReverseColorList: Object[] = [
    { index: 8, colorNum: 'VC8' },
    { index: 9, colorNum: 'VC9' },
    { index: 10, colorNum: 'VC10' },
    { index: 11, colorNum: 'VC11' },
    { index: 12, colorNum: 'VC12' },
    { index: 13, colorNum: 'VC13' },
    { index: 14, colorNum: 'VC14' },
    { index: 15, colorNum: 'VC15' },
    { index: 16, colorNum: 'VC16' },
    { index: 17, colorNum: 'VC17' },
    { index: 18, colorNum: 'VC18' },
    { index: 19, colorNum: 'VC19' }
  ];

  // 선택된 default 색상
  public selectedDefaultColor: Object = this.defaultColorList[0];

  // 팔레트 show hide 설정
  public colorListFlag: boolean = false;

  // 선반 레이어 번호
  public layerNum: number = 0;

  // 레이어 타입 : symbol, line, polygon, tile, heatmap
  public type: string = 'symbol';

  // 레이어명
  public name: string = 'Layer1';

  // 심볼 타입
  public symbol: string = 'CIRCLE';

  // 타일맵 타입 현재는 HEXAGON만 있음
  public tile: string = 'HEXAGON';

  //heatmap 흐림
  public blur: number = 10;

  //heatmap 반경
  public radius:number = 10;

  //tilemap type
  public shape: string = "HEXAGON";

  //tilemap coverage
  public coverage: number = 8;

  //linemap type
  public pathType: string = "SOLID";

  // 심볼, 폴리곤, 라인등 feature의 색상
  public color: Object = {
    by: 'NONE',
    column: '',
    schema: this.selectedDefaultColor,
    transparency: 100
  };

  // feature의 크기
  public size: Object = {
    by: 'NONE',
    column: ''
  };

  // 외곽선 스타일
  public outline: Object = {
    color: this.selectedDefaultColor,
    thickness: 'NONE'
  };

  //라인 스타일
  public thickness: Object = {
    by: "NONE",
    column: "NONE",
    maxValue: 10
  };

  // 색상, 크기 기준이 measuer 일때 필드 리스트
  public measureList = [];

  // range list for view
  public rangesViewList = [];

  // gradation seperate value
  public separateValue: number = 10;

  // currently seleted color range
  public currentRange: ColorRange;

  // min / max
  public minValue: string;
  public maxValue: string;

  public availableRangeValue: string;

  public clustering: boolean = false;
  public viewRawData: boolean = false;
  public layerOptions: Object[];

  // 색상의 기준이 되는 행/열 필드 리스트
  public fieldList: string[] = [];

  // color type show hide 설정
  public colorTypeFlag: boolean = false;

  // thickness type show hide 설정
  public thicknessTypeFlag: boolean = false;

  // 투명도 설정
  public transparencyFlag: boolean = false;

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Private Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Protected Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Public Variables
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  @Input('index')
  public index: number;

  // 선반데이터
  @Input('pivot')
  public pivot: Pivot;

  @Input('resultData')
  public resultData: Object;

  @ViewChild('blurRangeSlider')
  private _blurRangeSlider: ElementRef;
  private _$blurRangeSlider: any;

  @ViewChild('radiusRangeSlider')
  private _radiusRangeSlider: ElementRef;
  private _$radiusRangeSlider: any;

  @ViewChild('resolutionRangeSlider')
  private _resolutionRangeSlider: ElementRef;
  private _$resolutionRangeSlider: any;

  @Input('uiOption')
  public set setUiOption(uiOption: UIOption) {

   //Set
   if(this.resultData['data'][this.index].valueRange[uiOption.layers[this.index].color.column]) {
     const minValue = this.checkMinZero(this.resultData['data'][this.index].valueRange[uiOption.layers[this.index].color.column].minValue, this.resultData['data'][this.index].valueRange[uiOption.layers[this.index].color.column].minValue);

     this.minValue = FormatOptionConverter.getDecimalValue(minValue, uiOption.valueFormat.decimal, uiOption.valueFormat.useThousandsSep);
     this.maxValue = FormatOptionConverter.getDecimalValue(this.resultData['data'][this.index].valueRange[uiOption.layers[this.index].color.column].maxValue, uiOption.valueFormat.decimal, uiOption.valueFormat.useThousandsSep);
   }

   this.uiOption = uiOption;

   // Set field list
   this.fieldList = _.filter(this.uiOption.fieldList, (field) => {
     let isNotGeoField: boolean = true;
     _.each(this.pivot.columns, (dimension) => {
       if( _.eq(field, dimension.name)
          && (_.eq(dimension.field.logicalType, "GEO_POINT") || _.eq(dimension.field.logicalType, "GEO_LINE") || _.eq(dimension.field.logicalType, "GEO_POLYGON")) ) {
         isNotGeoField = false;
       }
     });
     return isNotGeoField;
   });
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
  | Constructor
  |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // 생성자
  constructor(private datasourceService: DatasourceService,
              protected elementRef: ElementRef,
              protected injector: Injector,
              private zone: NgZone) {

    super(elementRef, injector);
  }

  /*-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
   | Override Method
   |-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=*/

  // Init
  public ngOnInit() {

    this.type = this.uiOption.layers[this.index].type;
    this.name = this.uiOption.layers[this.index].name;
    this.symbol = this.uiOption.layers[this.index].symbol;
    this.color = this.uiOption.layers[this.index].color;
    this.size = this.uiOption.layers[this.index].size;
    this.outline = this.uiOption.layers[this.index].outline;
    this.clustering = this.uiOption.layers[this.index].clustering;

    this.measureList = [];
    for(let field of this.uiOption.fieldMeasureList) {
      if(field["layerNum"] && field["layerNum"] === (this.index + 1)) {
        this.measureList.push(field.alias.toString());
      }
    }

    if(this.color['customMode']) {
      this.rangesViewList = this.uiOption.layers[this.index].color['ranges'];
    }

    //timeout 없으면 가끔 slider가 textbox로 생성됨
    this.changeLayerOption();
    if(this.type === "heatmap") {
      setTimeout(
        () => {
          this.setBlurSlider();
          this.setRadiusSlider();
        }
      );
    } else if(this.type === "tile") {
      setTimeout(
        () => {
          this.setResolutionSlider();
        }
      );
    }

    // Init
    super.ngOnInit();
  }

  // Destory
  public ngOnDestroy() {

    // Destory
    super.ngOnDestroy();
  }

  /**
   * Input 값 변경 체크
   * @param {SimpleChanges} changes
   */
  public ngOnChanges(changes: SimpleChanges) {
    if(this.type === "heatmap") {
      setTimeout(
        () => {
          this.setBlurSlider();
          this.setRadiusSlider();
        }
      );
    } else if(this.type === "tile") {
      setTimeout(
        () => {
          this.setResolutionSlider();
        }
      );
    }
  } // function - ngOnChanges

  /**
   * Chart - 맵차트 레이어 타입
   * @param layerType
   */
  public mapLayerType(layerType: string): void {
     let geomType = this.uiOption.fielDimensionList[0].field.logicalType;

     if( this.index > 0 ) {
       for(let field of this.uiOption.fielDimensionList) {
         if(field["layerNum"] && field["layerNum"] === (this.index + 1)) {
           geomType = field.field.logicalType;
           break;
         }
       }
     }

     if(geomType === LogicalType.GEO_POINT) {
       if(layerType === "symbol" || layerType === "heatmap" || layerType === "tile") {
         console.log("point");
       } else {
         return;
       }
     } else if(geomType === LogicalType.GEO_LINE) {
       if(layerType === "line") {
         console.log("line");
       } else {
         return;
       }
     } else if(geomType === LogicalType.GEO_POLYGON) {
       if(layerType === "polygon") {
         console.log("polygon");
       } else {
         return;
       }
     }

     if(layerType === "heatmap" && this.color["by"] === "DIMENSION") {
       this.color["by"] = "NONE";
       this.color["schema"] = "#602663";
     }

     this.type = layerType;

     // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

     this.update();
   }

  /**
   * Chart - 레이어 심볼 타입
   * @param SymbolType
   */
  public symbolType(symbolType: string): void {

   this.symbol = symbolType;

   // 해당 레이어 타입으로 설정
   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   this.update();
  }

  /**
   * 컬러타입 변경시
   * @param type 컬러타입 (series(default), dimension)
   */
  public changeColorType(colorType: string) {

   this.color['by'] = colorType;

   // default schema
   if(colorType === 'NONE') {
     this.color['schema'] = '#602663';
   } else if(colorType === 'DIMENSION') {
     this.color['schema'] = 'SC1';
     // init column
     if (this.uiOption.layers[this.index]) {
       if (!this.uiOption.layers[this.index].color) this.uiOption.layers[this.index].color = {};
       this.uiOption.layers[this.index].color['column'] = "NONE";
     }
   } else if(colorType === 'MEASURE') {
     this.color['schema'] = 'VC1';
     this.color['ranges'] = this.setMeasureColorRange(this.uiOption, this.resultData['data'][this.index], ChartColorList[this.color['schema']]);
     // init column
     if (this.uiOption.layers[this.index]) {
       if (!this.uiOption.layers[this.index].color) this.uiOption.layers[this.index].color = {};
       this.uiOption.layers[this.index].color['column'] = "NONE";
     }
   }

   // 해당 레이어 타입으로 설정
   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   this.update();
  }

  /**
   * 팔레트 색상을 변경한다
   * @param {Object} color
   * @param {Object} gridColor
   */
  public changeColor(color: Object, gridColor?: Object) {

   // 차트 타입이 MEASURE인경우
   if (this.uiOption.layers[this.index].color.by === 'MEASURE') {

     this.uiOption.layers[this.index].color['ranges'] = this.setMeasureColorRange(this.uiOption, this.resultData['data'][this.index], ChartColorList[color['colorNum']]);

     // // 선택된 컬러를 변수에 설정
     // if( _.eq(this.uiOption.type, ChartType.GRID) ) {
     //   this.selectedMeasureColor = color;
     //   color = gridColor;
     // }
   } else {
     // 선택된 컬러를 변수에 설정
     this.selectedDefaultColor = color;
   }

   // color by series일때 사용자 색상지정(mapping) 설정
   this.setUserCodes(color);

   this.color['schema'] = color['colorNum'];

   // 해당 레이어 타입으로 설정
   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   // update
   this.update();
  }

  /**
   * 투명도 변경시
   * @param transparency 투명도
   */
  public changeTransparency(transparency: number) {

   this.color['transparency'] = transparency;

   // 해당 레이어 타입으로 설정
   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   this.update();
  }

  /**
   * 흐림 변경시
   * @param blur 흐림
   */
  public changeBlur(blur: number) {

   this.blur = blur;

   // 해당 레이어 타입으로 설정
   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   this.update();
  }

  /**
   * 반경 변경시
   * @param blur 흐림
   */
  public changeRadius(radius: number) {

   this.radius = radius;

   // 해당 레이어 타입으로 설정
   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   this.update();
  }

  /**
   * Tile Resolution 변경시
   * @param resolution
   */
  public changeResolution(resolution: number) {

   let precision = 5;
   switch (resolution) {
    case 10:
      precision = 5;
      break;
    case 9:
      precision = 6;
      break;
    case 8:
      precision = 7;
      break;
    case 7:
      precision = 8;
      break;
    case 6:
      precision = 9;
      break;
    case 5:
      precision = 10;
      break;
    default:
      precision = 5;
   }

   this.coverage = resolution;

   // 해당 레이어 타입으로 설정
   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   //query할때 precision 값 전달하기 위해..
   this.pivot.columns[0]["precision"] = precision;

   this.update({});
  }

  /**
   * 사이즈 타입 변경시
   * @param type 사이즈타입 (series(default), dimension)
   */
  public changeSizeType(sizeType: string) {

    this.size['by'] = sizeType;

    // default schema
    if(sizeType === 'NONE') {

    } else if(sizeType === 'MEASURE') {

      // init column
      if (this.uiOption.layers[this.index]) {
        if (!this.uiOption.layers[this.index].size) this.uiOption.layers[this.index].size = {};
        this.uiOption.layers[this.index].size['column'] = "NONE";
        this.clustering = false;
      }
    }

    // 해당 레이어 타입으로 설정
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {
      layers: this.changeLayerOption()
    });

    this.update();
  }

  /**
   * 선형 타입 변경시
   * @param type 사이즈타입 (series(default), dimension)
   */
  public changeThicknessType(sizeType: string) {

   this.thickness['by'] = sizeType;

   // 해당 레이어 타입으로 설정
   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   this.update();
  }

  /**
   * 선형 컬럼 변경시
   * @param sizeCol 사이즈컬럼 (series(default), dimension)
   */
  public changeThicknessColumn(sizeCol: string) {

   this.thickness['column'] = sizeCol;

   // 해당 레이어 타입으로 설정
   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   this.update();
  }

  /**
   * 사이즈 컬럼 변경시
   * @param sizeCol 사이즈컬럼 (series(default), dimension)
   */
  public changeSizeColumn(sizeCol: string) {

   this.size['column'] = sizeCol;

   // 해당 레이어 타입으로 설정
   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   this.update();
  }

  /**
   * 컬러 컬럼 변경시
   * @param colorCol 컬러컬럼 (series(default), dimension)
   */
  public changeColorColumn(colorCol: string) {

   this.color['column'] = colorCol;
   this.color['ranges'] = this.setMeasureColorRange(this.uiOption, this.resultData['data'][this.index], ChartColorList[this.uiOption.layers[this.index].color['schema']]);

   // 해당 레이어 타입으로 설정
   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   this.update();
  }

  /**
   * Chart - 아웃라인 타입
   * @param outlineType
   */
  public outlineType(outlineType: string): void {

   this.outline['thickness'] = outlineType;

   // 해당 레이어 타입으로 설정
   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   this.update();
  }

  /**
   * Chart - 라인 유형
   * @param lineDashType
   */
  public lineDashType(lineDashType: string): void {

   this.pathType = lineDashType;

   // 해당 레이어 타입으로 설정
   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   this.update();
  }

  /**
   * outline on/off
   */
  public changeOutlineFlag() {
   if(this.outline['thickness'] !== 'NONE') {
     this.outline['thickness'] = 'NONE';
   } else {
     this.outline['thickness'] = 'THIN';
   }

   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   this.update();
  }

  /**
   * view raw data on/off
   */
  public changeViewRawDataFlag() {

   this.viewRawData = !this.viewRawData;

   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   //query할때 원본보기 선택하기 위해..
   this.pivot.columns[0]["viewRawData"] = this.viewRawData;

   this.update({});
  }

  /**
   * feature single color
   * @param event
   */
  public selectSingleColor(event: any) {
   this.color['schema'] = event;

   // 해당 레이어 타입으로 설정
   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   this.update();
  }

  /**
   * feature outline color
   * @param event
   */
  public selectOutlineColor(event: any) {
   this.outline['color'] = event;

   // 해당 레이어 타입으로 설정
   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   this.update();
  }

  /**
   * 레이어명을 변경한다.
   */
  public changeLayerName() {
   this.name = this.uiOption.layers[this.index].name;

   // 해당 레이어명으로 설정
   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   // update
   this.update();
  }

  /**
   * line max width
   */
  public changeStrokeMaxWidth() {
   this.thickness = this.uiOption.layers[this.index].thickness;

   // 해당 레이어명으로 설정
   this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

   // update
   this.update();
  }

  /**
   *
   * @returns {UILayers}
   */
  public changeLayerOption() {

    let option: Object = {
      type: this.type,
      name: this.name,
      symbol: this.symbol,
      color: this.color,
      size: this.size,
      outline: this.outline,
      clustering: this.clustering,
      viewRawData: this.viewRawData
    };

    // set options to current layer
    this.uiOption.layers[this.index] = option;

    this.measureList = [];
    for(let field of this.uiOption.fieldMeasureList) {
      if(field["layerNum"] && field["layerNum"] === (this.index + 1)) {
        this.measureList.push(field.alias.toString());
      }
    }

   // when color column is none or empty, set default column
   if (this.uiOption.layers && this.uiOption.layers.length > 0 &&
       'NONE' == this.uiOption.layers[this.index].color['column'] || !this.uiOption.layers[this.index].color['column']) {

     if (!this.uiOption.layers[this.index].color) this.uiOption.layers[this.index].color = {};

     const colorType = this.uiOption.layers[this.index].color.by;

     // when it's dimension, set default column
     if ('DIMENSION' === colorType) {

       this.uiOption.layers[this.index].color['column'] = this.uiOption.fieldList[0];

       // when it's measure, set default column
     } else if ('MEASURE' === colorType && this.measureList && this.measureList.length > 0) {

       this.uiOption.layers[this.index].color['column'] = this.measureList[0];
     }
   }

   // when size column is none or empty, set default column
   if (this.uiOption.layers && this.uiOption.layers.length > 0 &&
       'NONE' == this.uiOption.layers[this.index].size['column'] || !this.uiOption.layers[this.index].size['column']) {

     if (!this.uiOption.layers[this.index].size) this.uiOption.layers[this.index].size = {};

     const sizeType = this.uiOption.layers[this.index].size.by;

       // when it's measure, set default column
     if ('MEASURE' === sizeType && this.measureList && this.measureList.length > 0) {

       this.uiOption.layers[this.index].size['column'] = this.measureList[0];
     }
   }

   if(this.color['customMode']) {
     this.rangesViewList = this.color['ranges'];
   }

   return this.uiOption.layers[this.index];
  }

  /**
   * 옵션관련 숫자값 문자형으로 변환
   * @param type, val
   * @return string
   */
  public translateNumber(type: string, val: number) {
   let resultVal = '';

   if(type === 'heatmapBlur') {
     if(val === 5) {
       resultVal = '0%';
     } else if(val === 10) {
       resultVal = '20%';
     } else if(val === 15) {
       resultVal = '40%';
     } else if(val === 20) {
       resultVal = '60%';
     } else if(val === 25) {
       resultVal = '80%';
     } else if(val === 30) {
       resultVal = '100%';
     }
   }

   if(type === 'heatmapRadius') {
     if(val === 10) {
       resultVal = '20%';
     } else if(val === 15) {
       resultVal = '40%';
     } else if(val === 20) {
       resultVal = '60%';
     } else if(val === 25) {
       resultVal = '80%';
     } else if(val === 30) {
       resultVal = '100%';
     }
   }

   if(type === 'hexagonRadius') {
     if(val === 10) {
       resultVal = '100%';
     } else if(val === 9) {
       resultVal = '80%';
     } else if(val === 8) {
       resultVal = '60%';
     } else if(val === 7) {
       resultVal = '40%';
     } else if(val === 6) {
       resultVal = '20%';
     } else if(val === 5) {
       resultVal = '0%';
     }
   }

   if(type === 'transparency') {
     if(val === 80) {
       resultVal = '20%';
     } else if(val === 60) {
       resultVal = '40%';
     } else if(val === 40) {
       resultVal = '60%';
     } else if(val === 20) {
       resultVal = '80%';
     } else if(val === 0) {
       resultVal = '100%';
     }
   }

   return resultVal;
  }

  /**
   * mapping, mappingArray값 설정
   * @param color
   * @returns {string[]}
   */
  private setUserCodes(color: Object): Object {

   // // color by series가 아닐거나 mapping값이 없을때 return
   // if ((!_.eq(ChartColorType.SERIES, this.uiOption.layers[this.index].color.type) && !_.eq(ChartType.GAUGE, this.uiOption.type)) || (_.eq(ChartType.GAUGE, this.uiOption.type) && !_.eq(ChartColorType.DIMENSION, this.uiOption.layers[this.index].color.type))  || !(<UIChartColorBySeries>this.uiOption.layers[this.index].color).mapping) return;
   //
   // // 기존 색상 리스트
   // const colorList = ChartColorList[(<UIChartColorBySeries>this.uiOption.layers[this.index].color).schema];
   // (<UIChartColorBySeries>this.uiOption.layers[this.index].color).mappingArray.forEach((item, index) => {
   //
   //   // 다른코드값이 아닌경우
   //   if (_.eq(colorList[index], item['color'])) {
   //     const changedColorList = ChartColorList[color['colorNum']];
   //
   //     (<UIChartColorBySeries>this.uiOption.layers[this.index].color).mapping[item['alias']] = changedColorList[index];
   //     (<UIChartColorBySeries>this.uiOption.layers[this.index].color).mappingArray[index]['color'] = changedColorList[index];
   //   }
   // });
   //

   return (<UIChartColorBySeries>this.uiOption.layers[this.index].color);
  }

  /**
   * 타입이 series, diemnsion일때 코드값이 같은경우 해당 코드 리스트에서 index를 가져온다
   * @returns {any}
   */
  public checkDefaultSelectedColor(): number {
   // 컬러리스트에서 같은 코드값을 가지는경우
   for (const item of this.defaultColorList) {

     // 코드값이 같은경우
     if (JSON.stringify(this.uiOption.layers[this.index].color['schema']) === JSON.stringify(item['colorNum'])) {

       return item['index'];
     }
   }
  }

  /**
   * 타입이 measure일때 코드값이 같은경우 해당 코드 리스트에서 index를 가져온다
   * @returns {any}
   */
  public checkMeasureSelectedColor(): void {

     let colorList: Object[] = [];

     // measure color list 합치기
     colorList = colorList.concat(this.measureColorList);
     colorList = colorList.concat(this.measureReverseColorList);

     // 컬러리스트에서 같은 코드값을 가지는경우
     for (const item of colorList) {

       // 코드값이 같은경우
       if (JSON.stringify(this.uiOption.layers[this.index].color['schema']) === JSON.stringify(item['colorNum'])) {

         return item['index'];
       }
     }

     // colorList = [];
     //
     // // Grid용: measure color list 합치기
     // colorList = colorList.concat(this.measureColorList);
     // colorList = colorList.concat(this.measureReverseColorList);
     //
     // // 컬러리스트에서 같은 코드값을 가지는경우
     // for (const item of colorList) {
     //
     //   // 코드값이 같은경우
     //   if (JSON.stringify(this.uiOption.layers[this.index].color['schema']) === JSON.stringify(item['colorNum'])) {
     //
     //     return item['index'];
     //   }
     // }
}

  /**
   * 컬러리스트버튼 toggle시
   */
  public toggleColorList() {

   // colostListFlag 반대값 설정
   this.colorListFlag = !this.colorListFlag;
  }

  /**
   * color range on / off 버튼 변경시
   */
  public changeColorRange() {

    let colorOption = <any>this.uiOption.layers[this.index].color;

    // custom color setting이 없을때
    if (!this.uiOption.layers[this.index].color['customMode']) {

      colorOption['customMode'] = ColorCustomMode.SECTION;

      // ranges 값이 없는경우 uiOption update
      if (!(<UIChartColorByValue>this.uiOption.layers[this.index].color).ranges) {

        const ranges = this.setMeasureColorRange(this.uiOption, this.resultData['data'][this.index], ChartColorList[this.uiOption.layers[this.index].color['schema']]);

        this.color['schema'] = (<UIChartColorBySeries>this.uiOption.layers[this.index].color).schema;
        this.color['customMode'] = (<UIChartColorByValue>this.uiOption.layers[this.index].color).customMode;
        this.color['ranges'] = ranges;
        this.rangesViewList = ranges;

      }
    // color range hide일때
    } else {

    let ranges = this.setMeasureColorRange(this.uiOption, this.resultData['data'][this.index], <any>ChartColorList[(<UIChartColorBySeries>this.uiOption.layers[this.index].color).schema]);
      // color by measure기본 ranges값으로 초기화

      this.color['schema'] = (<UIChartColorBySeries>this.uiOption.layers[this.index].color).schema;
      this.color['ranges'] = ranges;
      this.color['customMode'] = null;

    }

    // this.uiOption = <UIOption>_.extend({}, this.uiOption, {
    //   color: colorOption
    // });

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
   });

    this.update();
  }

  /**
   * set minvalue zero by chart types
   * @param {number} minValue
   * @param {number} elseValue
   */
  private checkMinZero(minValue: number, elseValue: number) {

    let returnValue: number = elseValue;

    // switch(this.uiOption.type) {
    //
    //   // charts minvalue is zero
    //   case ChartType.BAR:
    //   case ChartType.LINE:
    //   case ChartType.SCATTER:
    //   case ChartType.BOXPLOT:
    //   case ChartType.COMBINE:
    //     if (minValue >= 0) returnValue = 0;
    // }

    return returnValue;
  }

  /**
   * color by measure)데이터에 맞게 색상 범위 균등분할
   */
  public equalColorRange(): void {

    // 색상 범위리스트
    const rangeList = (<UIChartColorByValue>this.uiOption.layers[this.index].color).ranges;

    let colorList = <any>_.cloneDeep(ChartColorList[this.uiOption.layers[this.index].color['schema']]);

    // rangeList에서의 색상을 색상리스트에 설정
    rangeList.reverse().forEach((item, index) => {

      colorList[index] = item.color;
    });

    // set color ranges
    this.uiOption.layers[this.index].color['ranges'] = this.setMeasureColorRange(this.uiOption, this.resultData['data'][this.index], colorList, rangeList);

    // this.uiOption = <UIOption>_.extend({}, this.uiOption, { color : this.uiOption.layers[this.index].color });

    this.color = this.uiOption.layers[this.index].color;

    this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

    this.update();
  }

  /**
   * return ranges of color by measure
   * @returns {any}
   */
  public setMeasureColorRange(uiOption, data, colorList: any, colorAlterList = []): ColorRange[] {

    // return value
    let rangeList = [];

    let rowsListLength = data.features.length;

    let gridRowsListLength = data.features.length;


    // colAlterList가 있는경우 해당 리스트로 설정, 없을시에는 colorList 설정
    let colorListLength = colorAlterList.length > 0 ? colorAlterList.length - 1 : colorList.length - 1;

    // less than 0, set minValue
    const minValue = data.valueRange[uiOption.layers[this.index].color.column].minValue >= 0 ? 0 : _.cloneDeep(data.valueRange[uiOption.layers[this.index].color.column].minValue);

    // 차이값 설정 (최대값, 최소값은 값을 그대로 표현해주므로 length보다 2개 작은값으로 빼주어야함)
    const addValue = (data.valueRange[uiOption.layers[this.index].color.column].maxValue - minValue) / colorListLength;

    let maxValue = _.cloneDeep(data.valueRange[uiOption.layers[this.index].color.column].maxValue);

    let shape;
    // if ((<UIScatterChart>uiOption).pointShape) {
    //   shape = (<UIScatterChart>uiOption).pointShape.toString().toLowerCase();
    // }

    // set decimal value
    const formatValue = ((value) => {
      return parseFloat((Number(value) * (Math.pow(10, uiOption.valueFormat.decimal)) / Math.pow(10, uiOption.valueFormat.decimal)).toFixed(uiOption.valueFormat.decimal));
    });

    // decimal min value
    let formatMinValue = formatValue(data.valueRange[uiOption.layers[this.index].color.column].minValue);
    // decimal max value
    let formatMaxValue = formatValue(data.valueRange[uiOption.layers[this.index].color.column].maxValue);

    // set ranges
    for (let index = colorListLength; index >= 0; index--) {

      let color = colorList[index];

      // set the biggest value in min(gt)
      // if (colorListLength == index) {
      //
      //   rangeList.push(UI.Range.colorRange(ColorRangeType.SECTION, color, formatMaxValue, null, formatMaxValue, null, shape));
      //
      // } else {
        // if it's the last value, set null in min(gt)
        let min = 0 == index ? null : formatValue(maxValue - addValue);

        // if value if lower than minValue, set it as minValue
        if (min < data.valueRange.minValue && min < 0) min = _.cloneDeep(formatMinValue);

          rangeList.push(UI.Range.colorRange(ColorRangeType.SECTION, color, min, formatValue(maxValue), min, formatValue(maxValue), shape));

        maxValue = min;
      // }
    }

    return rangeList;
  }

  /**
   * 새로운 색상범위 추가버튼클릭시
   */
  public addNewRange(index: number) {

    // 색상 범위리스트
    const rangeList = (<UIChartColorByValue>this.uiOption.layers[this.index].color).ranges;

    // uiOption minValue의 range에 설정할값 양수일때에는 0, 음수일때에는 minValue로 설정
    const uiMinValue = this.resultData['data'][this.index].valueRange[this.uiOption.layers[this.index].color.column].minValue >= 0 ? 0 : Math.floor(Number(this.resultData['data'][this.index].valueRange[this.uiOption.layers[this.index].color.column].minValue) * (Math.pow(10, this.uiOption.valueFormat.decimal))) / Math.pow(10, this.uiOption.valueFormat.decimal);

    // 최대값
    let maxValue = rangeList[index - 1].gt;
    let minValue = rangeList[index].gt ? rangeList[index].gt : uiMinValue;

    // 현재 단계의 최소값 설정
    minValue = minValue + (maxValue - minValue) / 2;

    const formatMinValue =  Math.floor(Number(minValue) * (Math.pow(10, this.uiOption.valueFormat.decimal))) / Math.pow(10, this.uiOption.valueFormat.decimal);
    const formatMaxValue =  Math.floor(Number(maxValue) * (Math.pow(10, this.uiOption.valueFormat.decimal))) / Math.pow(10, this.uiOption.valueFormat.decimal);

    // 하위단계의 최대값 현재 최소값으로 변경
    rangeList[index].lte = formatMinValue;
    rangeList[index].fixMax = formatMinValue;

    let currentColor = rangeList[index].color;

    // 새로운 범위값 추가
    rangeList.splice(index, 0, UI.Range.colorRange(ColorRangeType.SECTION, currentColor, formatMinValue, formatMaxValue, formatMinValue, formatMaxValue));

    // this.color['type'] = this.uiOption.layers[this.index].color.type;
    this.color['schema'] = (<UIChartColorBySeries>this.uiOption.layers[this.index].color).schema;
    this.color['customMode'] = (<UIChartColorByValue>this.uiOption.layers[this.index].color).customMode;
    this.color['ranges'] = rangeList;
    this.color['colorTarget'] = this.uiOption.layers[this.index].color['colorTarget'];

    // 해당 레이어 타입으로 설정
     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
     });

    this.update();
  }

  /**
   * 선택된 컬러범위를 제거
   */
  public removeColorRange(range: ColorRange, index: number) {

    // 색상 범위리스트
    const rangeList = (<UIChartColorByValue>this.uiOption.layers[this.index].color).ranges;

    // rangeList가 1개 남은경우 삭제불가
    if (1 == rangeList.length) return;

    let upperValue = rangeList[index - 1] ? rangeList[index - 1] : null;
    let lowerValue = rangeList[index + 1] ? rangeList[index + 1] : null;

    // 상위, 하위값 둘다있는경우
    if (upperValue && lowerValue) {
      // 상위범위 최대값
      let upperMaxValue = rangeList[index - 1].lte ? rangeList[index - 1].lte : rangeList[index - 1].gt;
      // 하위범위 최소값
      let lowerMinValue = rangeList[index + 1].gt ? rangeList[index + 1].gt : rangeList[index + 1].lte;

      // 삭제시 상위 최소값, 하위 최대값 자동변경값
      let autoChangeValue = Math.floor(Number((upperMaxValue + lowerMinValue) / 2) * (Math.pow(10, this.uiOption.valueFormat.decimal))) / Math.pow(10, this.uiOption.valueFormat.decimal);


      // 삭제된 상위값 최소값 변경
      rangeList[index - 1].gt = autoChangeValue;
      rangeList[index - 1].fixMin = autoChangeValue;
      // 삭제된 하위값 최대값 변경
      rangeList[index + 1].lte = autoChangeValue;
      rangeList[index + 1].fixMax = autoChangeValue;
    }

    // 리스트에서 선택된 컬러범위 제거
    rangeList.splice(index, 1);

    this.color['ranges'] = rangeList;

    // 해당 레이어 타입으로 설정
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
    });

    this.update();

  }

  /**
   * 컬러팔렛트의 색상을 선택시
   */
  public colorPaletteSelected(colorCode: string, item?: any) {

    // color by series일때
    // if (this.uiOption.layers[this.index].color['by'].toString() == ChartColorType.SERIES) {
    //   // 선택된 필드의 index 가져오기
    //   const index = _.findIndex(this.uiOption.fieldMeasureList, {alias: item.alias});
    //
    //   const color = ChartColorList[(<UIChartColorBySeries>this.uiOption.layers[this.index].color).schema];
    //
    //   // 해당 선택된 아이템이 있는경우
    //   if (-1 !== index) {
    //
    //     // userCodes값이 없는경우 color codes값을 deep copy
    //     if (!(<UIChartColorBySeries>this.uiOption.layers[this.index].color).mapping) {
    //       (<UIChartColorBySeries>this.uiOption.layers[this.index].color).mapping = _.cloneDeep(color);
    //     }
    //
    //     // mapping list에 변경된값 설정
    //     (<UIChartColorBySeries>this.uiOption.layers[this.index].color).mappingArray[index]['color'] = colorCode;
    //
    //     // uiOption userCodes에 세팅
    //     (<UIChartColorBySeries>this.uiOption.layers[this.index].color).mapping[(<UIChartColorBySeries>this.uiOption.layers[this.index].color).mappingArray[index]['alias']] = colorCode;
    //
    //
    //     this.color['by'] = this.uiOption.layers[this.index].color.by;
    //     this.color['mapping'] = (<UIChartColorBySeries>this.uiOption.layers[this.index].color).mapping;
    //     this.color['mappingArray'] = (<UIChartColorBySeries>this.uiOption.layers[this.index].color).mappingArray;
    //     this.color['schema'] = (<UIChartColorBySeries>this.uiOption.layers[this.index].color).schema;
    //     this.color['settingUseFl'] = (<UIChartColorBySeries>this.uiOption.layers[this.index].color).settingUseFl;
    //
    //     // 해당 레이어 타입으로 설정
    //     this.uiOption = <UIOption>_.extend({}, this.uiOption, {
    //      layers: this.changeLayerOption()
    //     });
    //
    //     this.update();
    //   }
    //   // color by measure일때
    // } else if (this.uiOption.layers[this.index].color['by'].toString() == ChartColorType.MEASURE) {

      const index = this.rangesViewList.indexOf(item);
      // 선택된 색상으로 설정
      (<UIChartColorByValue>this.uiOption.layers[this.index].color).ranges[index].color = colorCode;

      this.color['by'] = this.uiOption.layers[this.index].color.by;
      this.color['schema'] = (<UIChartColorBySeries>this.uiOption.layers[this.index].color).schema;
      this.color['ranges'] = (<UIChartColorByValue>this.uiOption.layers[this.index].color).ranges;
      this.color['customMode'] = (<UIChartColorByValue>this.uiOption.layers[this.index].color).customMode;

      // 해당 레이어 타입으로 설정
      this.uiOption = <UIOption>_.extend({}, this.uiOption, {
       layers: this.changeLayerOption()
      });

      // 선택된 필드 제거
      this.currentRange = null;

      this.update();
    // }
  }

  /**
   * range max 입력값 수정시
   * @param range
   * @param index
   */
  public changeRangeMaxInput(range: any, index: number): void {

    // 색상 범위리스트
    let rangeList = (<UIChartColorByValue>this.uiOption.layers[this.index].color).ranges;

    if (!range.lte || isNaN(FormatOptionConverter.getNumberValue(range.lte))) {

      // set original value
      range.lte = _.cloneDeep(FormatOptionConverter.getDecimalValue(rangeList[index].fixMax, this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep));
      return;
    }

    // parse string to value
    range = this.parseStrFloat(range);

    // uiOption minValue의 range에 설정할값 양수일때에는 0, 음수일때에는 minValue로 설정
    const uiMinValue = this.checkMinZero(this.resultData['data'][this.index].valueRange.minValue, this.resultData['data'][this.index].valueRange.minValue);

    // 하위 fixMin값
    const lowerfixMin = rangeList[index + 1] ?(rangeList[index + 1].fixMin) ? rangeList[index + 1].fixMin : rangeList[index + 1].fixMax : null;

    // 최소값인경우
    if (!rangeList[index + 1]) {

      // 사용가능범위인경우
      if (uiMinValue < range.lte && rangeList[index - 1].fixMin > range.lte) {

        range.fixMax = range.lte;
        rangeList[index-1].gt = range.lte;
      } else {
        // 기존값으로 리턴
        range.lte = range.fixMax;
      }
    }
    // 최대값이 입력가능범위를 벗어나는경우
    else if (range.fixMax < range.lte || (lowerfixMin > range.lte)) {

      // 기존값으로 리턴
      range.lte = range.fixMax;
    } else {
      range.fixMax = range.lte;
    }

    // 상위의 최대값에 같은값 입력
    if (rangeList[index - 1]) {

      rangeList[index - 1].fixMin = range.lte;
      rangeList[index - 1].gt = range.lte;
    }

    // 최소값이 현재 최대값보다 큰경우 최소값과 하위 최대값 변경
    if (null != range.fixMin && rangeList[index + 1] && range.fixMin > range.fixMax) {

      range.gt = range.fixMax;
      rangeList[index + 1].lte = range.fixMax;
      rangeList[index + 1].fixMax = range.fixMax;
    }

    // set changed range in list
    rangeList[index] = range;

    this.color = this.uiOption.layers[this.index].color;
    this.color['ranges'] = rangeList;

    // 해당 레이어 타입으로 설정
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
    });

    this.update();
  }

  /**
   * range min 입력값 수정시
   * @param range
   * @param index
   */
  public changeRangeMinInput(range: any, index: number): void {

    // 색상 범위리스트
    let rangeList = (<UIChartColorByValue>this.uiOption.layers[this.index].color).ranges;

    if (!range.gt || isNaN(FormatOptionConverter.getNumberValue(range.gt))) {
      // set original value
      range.gt = _.cloneDeep(FormatOptionConverter.getDecimalValue(rangeList[index].fixMin, this.uiOption.valueFormat.decimal, this.uiOption.valueFormat.useThousandsSep));
      return;
    }

    // parse string to value
    range = this.parseStrFloat(range);

    let decimalValue = this.resultData['data'][this.index].valueRange.minValue;

    // uiOption minValue의 range에 설정할값 양수일때에는 0, 음수일때에는 minValue로 설정
    const uiMinValue = this.checkMinZero(this.resultData['data'][this.index].valueRange.minValue, decimalValue);

    // 입력가능 최소 / 최대범위 구하기
    let minValue = rangeList[index + 1] ? rangeList[index + 1].gt ? rangeList[index + 1].gt : uiMinValue :
                   rangeList[index].gt ? rangeList[index].gt : rangeList[index].lte;
    let maxValue = range.lte;

    // 최대값인경우 (변경불가)
    if (!rangeList[index - 1]) {

      // 최대값보다 큰거나 하위의 최대값보다 값이 작은경우
      if (this.resultData['data'][this.index].valueRange.maxValue < range.gt || rangeList[index + 1].fixMax > range.gt) {
        range.gt = range.fixMin;
      } else {
        range.fixMin = range.gt;
      }
    }
    // 최소값이 입력가능범위를 벗어나는경우
    else if (minValue > range.gt || maxValue < range.gt) {

      // 기존값으로 리턴
      range.gt = range.fixMin;
    } else {
      range.fixMin = range.gt;
    }

    // 하위의 최대값에 같은값 입력
    if (rangeList[index + 1]) {

      rangeList[index + 1].lte = range.gt;
      rangeList[index + 1].fixMax = range.gt;
    }

    // set changed range in list
    rangeList[index] = range;

    this.color = this.uiOption.layers[this.index].color;
    this.color['ranges'] = rangeList;

    // 해당 레이어 타입으로 설정
    this.uiOption = <UIOption>_.extend({}, this.uiOption, {
     layers: this.changeLayerOption()
    });

    this.update();
  }

  /**
   * 입력 가능범위값 리턴
   */
  public availableRange(currentRnage: any, index: number): void {

    // color range list
    const rangeList = this.rangesViewList;

    let returnString: string = '';

    // case max value
    if (0 == index) {

      returnString += ': ' + currentRnage.fixMin;

    // case min value
    } else if (rangeList.length - 1 == index) {

      returnString += ': ' + currentRnage.fixMax;
    }
    else {

      // 하위값이 있는경우 하위값의 min값이 있는경우 min값으로 설정 없는경우 최소값 설정
      let availableMin = !rangeList[index + 1] ? null : rangeList[index + 1].fixMin ? rangeList[index + 1].fixMin : rangeList[index + 1].fixMax;
      let availableMax = currentRnage.fixMax;

      if (null !== availableMin) returnString += ': ' + availableMin.toString() + ' ~ ';
      if (null !== availableMax) returnString += availableMax.toString();
    }

    this.availableRangeValue = returnString;
  }

  /**
   * parse string to float
   * @param range
   * @returns {any}
   */
  private parseStrFloat(range: any): any {

    range.fixMax = null == range.fixMax ? null : FormatOptionConverter.getNumberValue(range.fixMax);
    range.fixMin = null == range.fixMin ? null : FormatOptionConverter.getNumberValue(range.fixMin);
    range.gt     = null == range.gt ? null : FormatOptionConverter.getNumberValue(range.gt);
    range.lte    = null == range.lte ? null : FormatOptionConverter.getNumberValue(range.lte);
    return range;
  }

  public setRadiusSlider() {
    const scope = this;
    this._$radiusRangeSlider = $(this._radiusRangeSlider.nativeElement);
    this._$radiusRangeSlider.ionRangeSlider(
      {
        hide_from_to: false,
        hide_min_max: true,
        keyboard: false,
        min: 5,
        max: 30,
        from: (<UIHeatmapLayer>scope.uiOption.layers[this.index]).radius,
        type: 'single',
        step: 5,
        onChange(data) {
          scope.changeRadius(data.from);
        }
      })
  }

  public setResolutionSlider() {
    const scope = this;
    this._$resolutionRangeSlider = $(this._resolutionRangeSlider.nativeElement);
    this._$resolutionRangeSlider.ionRangeSlider(
      {
        hide_from_to: false,
        hide_min_max: true,
        keyboard: false,
        min: 5,
        max: 10,
        from: scope.uiOption.layers[this.index].color.resolution,
        type: 'single',
        step: 1,
        onChange(data) {
          scope.changeResolution(data.from);
        }
      })
  }

  public setBlurSlider() {
    const scope = this;
    this._$blurRangeSlider = $(this._blurRangeSlider.nativeElement);
    this._$blurRangeSlider.ionRangeSlider(
      {
        hide_from_to: false,
        hide_min_max: true,
        keyboard: false,
        min: 5,
        max: 30,
        from: (<UIHeatmapLayer>scope.uiOption.layers[this.index]).blur,
        type: 'single',
        step: 5,
        onChange(data) {
          scope.changeBlur(data.from);
        }
      })
  }

}
