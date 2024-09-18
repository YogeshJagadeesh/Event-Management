import React, { useCallback, useRef, useState } from "react";
import { Dimensions, LayoutChangeEvent, StyleSheet, View } from "react-native";
import ModalView from "../../../../Common/ModalView";
import { Text, TouchableOpacity } from "react-native-ui-lib";
import Ionicons from "react-native-vector-icons/Ionicons";
import { convertToString } from "../../../../utils/helper";
// import FlatListArrayRender from "../../../../Common/FlatListArrayRender";
import { failToast } from "../../../../Common/ToastServices/ToastDisplay";
import SalesOrdersButton from "../SalesOrdersProductDetails/SalesOrdersButton";
import TextInputOnChangeComponent from "../../../../Common/TextInputOnChangeComponent";
import { Code, CodeScannerFrame, useCameraDevice, useCodeScanner, Camera } from "react-native-vision-camera";

type CameraHighlight = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CodeScannerPageProps = {
  itemCode?: any;
  _handleBack: (e?: any) => void;
  onSuccessQr: (data: string, value: string) => void;
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height
  },
  scannerContainer: {
    flex: 1,
    position: "relative"
  },
  highlightBox: {
    borderWidth: 2,
    borderColor: "red",
    position: "absolute"
  },
  scanBox: {
    borderWidth: 2,
    borderRadius: 10,
    borderColor: "green",
    position: "absolute"
  },
  overlay: {
    position: "absolute",
    backgroundColor: "rgba(0, 0, 0, 1)"
  },
  rightButtonRow: {
    top: 0,
    left: 0,
    right: 0,
    padding: 15,
    alignItems: "center",
    position: "absolute",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  // container: {
  //   alignItems: "center",
  //   justifyContent: "center",
  //   ...StyleSheet.absoluteFillObject
  // },
  finder: {
    alignItems: "center",
    justifyContent: "center"
  },
  topLeftEdge: {
    position: "absolute",
    top: 0,
    left: 0
  },
  topRightEdge: {
    position: "absolute",
    top: 0,
    right: 0
  },
  bottomLeftEdge: {
    position: "absolute",
    bottom: 0,
    left: 0
  },
  bottomRightEdge: {
    position: "absolute",
    bottom: 0,
    right: 0
  },
  maskOuter: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "space-around"
  },
  maskInner: {
    backgroundColor: "transparent"
  },
  maskRow: {
    width: "100%"
  },
  maskCenter: {
    display: "flex",
    flexDirection: "row"
  },
  animatedLine: {
    position: "absolute",
    elevation: 4,
    zIndex: 0
  }
});
export function CodeScannerPage(props: CodeScannerPageProps): React.ReactElement {
  const { _handleBack = () => {}, itemCode = {}, onSuccessQr = () => {} } = props;
  const scanBoxWidth = 200;
  const scanBoxHeight = 100;
  const camera = useRef<Camera>(null);
  const device = useCameraDevice("back");
  const [iMEINo, setIMEINo] = useState("");
  const [torch, setTorch] = useState(false);
  const [visible, setVisible] = useState(true);
  // const [isInitialized, setIsInitialized] = useState(false);
  const [isScannerActive, setIsScannerActive] = useState(false);
  //   const [scannedCodesList, setScannedCodesList] = useState([]);
  const scanBoxLeft = Dimensions.get("window").width / 2 - scanBoxWidth / 2;
  const scanBoxTop = Dimensions.get("window").height / 2 - scanBoxHeight / 2;
  const [scanFrame, setScanFrame] = useState<CodeScannerFrame>({ height: 1, width: 1 });
  const [selectedBarcodeIndex, setSelectedBarcodeIndex] = useState<number | null>(null);
  const [codeScannerHighlights, setCodeScannerHighlights] = useState<CameraHighlight[]>([]);
  const [layout, setLayout] = useState<LayoutChangeEvent["nativeEvent"]["layout"]>({ x: 0, y: 0, width: 0, height: 0 });

  const codeScanner = useCodeScanner({
    codeTypes: [
      "qr",
      "ean-13",
      "codabar",
      "code-128",
      "code-39",
      "upc-a",
      "ean-8",
      "code-93",
      "data-matrix",
      "ean-13",
      "itf",
      "pdf-417"
    ],
    onCodeScanned: (codes: Code[], frame: CodeScannerFrame) => {
      try {
        const filteredCodes = codes.filter((code) => {
          const highlight: CameraHighlight = {
            height: code.frame?.height ?? 0,
            width: code.frame?.width ?? 0,
            x: code.frame?.x ?? 0,
            y: code.frame?.y ?? 0
          };
          return isInsideScanBox(highlight); // Only process codes within the scan box
        });

        if (filteredCodes.length > 0) {
          const scannedCode = filteredCodes[selectedBarcodeIndex ?? 0]; // Process the first code, or any selected one
          setIMEINo(scannedCode.value);
          setVisible(false);
          setSelectedBarcodeIndex(null);
        }

        setScanFrame(frame);
        setCodeScannerHighlights(
          filteredCodes.map((code) => ({
            height: code.frame?.height ?? 0,
            width: code.frame?.width ?? 0,
            x: code.frame?.x ?? 0,
            y: code.frame?.y ?? 0
          }))
        );
      } catch (error) {
        failToast(`Error in onCodeScanned: ${error}`);
      }
    }
  });
  const onChange = (event: any) => {
    const { target: { value = "" } = {} } = event;
    setIMEINo(value);
  };
  const onLayout = (evt: LayoutChangeEvent) => {
    if (evt.nativeEvent.layout) {
      setLayout(evt.nativeEvent.layout);
    }
  };

  const isInsideScanBox = (highlight: CameraHighlight) => {
    const top = highlight.y * (layout.height / scanFrame.width); // Adjust for screen layout
    const left = highlight.x * (layout.width / scanFrame.height); // Adjust for screen layout
    const width = highlight.width * (layout.width / scanFrame.height); // Adjust based on scan frame size
    const height = highlight.height * (layout.height / scanFrame.width); // Adjust based on scan frame size

    return (
      left + width > scanBoxLeft &&
      left < scanBoxLeft + scanBoxWidth &&
      top + height > scanBoxTop &&
      top < scanBoxTop + scanBoxHeight
    );
  };

  const onHighlightBoxPress = useCallback((index: number) => {
    setSelectedBarcodeIndex(index);
    setIsScannerActive(true);
  }, []);

  // const handleCameraInitialized = () => {
  //   setTimeout(() => {
  //     setIsInitialized(true);
  //   }, 100);
  // };

  const submitImeiNo = () => {
    if (iMEINo !== "") {
      onSuccessQr(iMEINo, itemCode);
    } else {
      failToast("Please Enter IMEI");
    }
  };
  const applyMaskFrameStyle = () => ({
    backgroundColor: "#000",
    opacity: 0.5,
    flex: 1
  });
  //   const renderCodesListData = (item, i) => {
  //     return (
  //       <View className="p-2 border border-gray-300" key={convertToString(i) + "scannedCode"}>
  //         <TouchableOpacity onPress={() => setIMEINo(item.value)}>
  //           <Text>{item.value}</Text>
  //         </TouchableOpacity>
  //       </View>
  //     );
  //   };
  return (
    <ModalView visible={true} onRequestClose={() => _handleBack(false)}>
      <View style={styles.container}>
        {device != null && (
          <View style={[styles.scannerContainer]}>
            <Camera
              style={StyleSheet.absoluteFill}
              device={device}
              isActive={visible}
              codeScanner={isScannerActive ? codeScanner : null}
              torch={torch ? "on" : "off"}
              ref={camera}
              onLayout={onLayout}
              // onInitialized={handleCameraInitialized}
            />
            <View style={styles.maskOuter}>
              <View style={[styles.maskRow, applyMaskFrameStyle()]} />
              <View style={[{ height: 100 }, styles.maskCenter]}>
                <View style={applyMaskFrameStyle()} />
                <View style={[styles.maskInner, { width: 300, height: 100 }]}>
                  <TouchableOpacity
                    style={{ borderColor: "red", borderWidth: 1, flex: 1 }}
                    onPress={() => setIsScannerActive(true)}
                  ></TouchableOpacity>
                </View>
                <View style={applyMaskFrameStyle()} />
              </View>
              <View style={[styles.maskRow, applyMaskFrameStyle()]} />
            </View>
            {/* {codeScannerHighlights.map(
              (highlight, index) =>
                isInsideScanBox(highlight) && (
                  <TouchableOpacity
                    key={convertToString(index) + "highlightCode"}
                    onPress={() => onHighlightBoxPress(index)}
                  >
                    <View
                      style={[
                        styles.highlightBox,
                        {
                          right: highlight.x * (layout.width / scanFrame.height),
                          top: highlight.y * (layout.height / scanFrame.width),
                          height: highlight.height * (layout.width / scanFrame.height),
                          width: highlight.width * (layout.height / scanFrame.width)
                        }
                      ]}
                    />
                  </TouchableOpacity>
                )
            )} */}
          </View>
        )}
      </View>
      <View style={styles.rightButtonRow}>
        <TouchableOpacity onPress={() => _handleBack(false)}>
          <Ionicons name="chevron-back" color="white" size={35} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setTorch(!torch)}>
          <Ionicons name={torch ? "flash" : "flash-off"} color="white" size={24} />
        </TouchableOpacity>
      </View>
      <View className="p-4 w-full absolute bg-white bottom-0 right-0 left-0">
        {/* {scannedCodesList.length > 0 && (
          <FlatListArrayRender
            loader={false}
            arrayName="codesList"
            data={scannedCodesList}
            arrayListDataCount={scannedCodesList.length}
            renderItem={renderCodesListData}
          />
        )} */}
        <View className="flex-row space-x-2">
          <View className="flex-1 relative">
            <TextInputOnChangeComponent
              name="IMEI"
              state={iMEINo}
              onChange={onChange}
              placeholder="Enter IMEI No."
              placeholderTextColor={"#00000050"}
              className="w-full  text-black py-0.5  px-2 border-gray-400 border border-opacity-30"
            />
            <View className="absolute right-2 top-2">
              <TouchableOpacity
                onPress={() => {
                  setIMEINo("");
                  setVisible(true);
                  setIsScannerActive(true);
                }}
              >
                <Ionicons name="close" color="#fb6c00" size={20} className="m-0 p-0" />
              </TouchableOpacity>
            </View>
          </View>
          <View className="w-3/12">
            <SalesOrdersButton
              disabled={!iMEINo}
              buttonName="Submit"
              variant={"ORANGE_BUTTON"}
              onPress={() => submitImeiNo()}
            />
          </View>
        </View>
        <View className="mt-4">
          <SalesOrdersButton buttonName="Close" onPress={() => _handleBack(false)} variant={"BLUE_BACKGROUND_BUTTON"} />
        </View>
      </View>
    </ModalView>
  );
}

export default CodeScannerPage;