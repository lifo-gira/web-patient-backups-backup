import React, { useEffect, useRef, useState } from "react";
import { FaPlay, FaPause } from "react-icons/fa";
import classNames from "classnames";
import Fit from "../assets/fit.jpg";
import Timer from "../additionals/Timer";
import Profile from "../assets/profile.jpg";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import {
  Label,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ToastContainer, toast } from "react-toastify";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Live from "./Live";

const Diagno = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBluetoothConnected, setIsBluetoothConnected] = useState(false);
  const [isLeg, setisLeg] = useState(false);
  const [socket, setSocket] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [timer, setTimer] = useState(120); // 2 minutes in seconds
  const [downloadEnabled, setDownloadEnabled] = useState(false);
  const [status, setStatus] = useState(localStorage.getItem("isLoggedIn"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [metrics, setMetrics] = useState([]);
  const messagesEndRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(false);

  const [metricArray, setmetricArray] = useState([]);
  const dotAppearance = isRunning ? { fill: "yellow", r: 5 } : { fill: "none" };
  const [chartData, setChartData] = useState(
    Array.from({ length: 120 }, (_, i) => ({ index: i + 1, val: 0 }))
  );
  var [elapsedTime, setElapsedTime] = useState(-1);

  var flag = 0;

  localStorage.setItem("lastCount", metricArray.length);
  const [data, setData] = useState([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  var [counter, setCounter] = useState(-1);
  const timerRef = useRef();
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  function showToastMessage() {
    toast.error("No more datas to be found", {
      position: toast.POSITION.TOP_RIGHT,
      autoClose: 1500,
    });
  }
  console.log(metricArray, "metricArray");

  function handleClick() {
    // Call the first function
    togglePlay();

    // Call the second function
    toggleChart();
  }

  const generateNewDataPoint = () => {
    console.log(metricArray, "metricArraygraph");
    console.log(counter, "counter");
    console.log(metricArray.length, "no of elemetns");
    if (counter < metricArray.length) {
      const newIndex = elapsedTime + 1;
      return {
        index: newIndex,
        val: metricArray[counter].val,
        ...dotAppearance,
      };
    } else {
      return null;
    }
  };

  const updateChart = () => {
    if (counter >= metricArray.length) {
      if (flag < 1) {
        showToastMessage();
        flag += 1;
      }
      setCounter(counter - 1);
      return;
    }
  
    if (!isPlaying) {
      // Only update the chart data, do not change isPlaying here
      if (counter < metricArray.length) counter = counter + 1;
      const newDataPoint = generateNewDataPoint();
      setCounter((prevCounter) => prevCounter + 1);
      setData((prevData) => [...prevData, newDataPoint]);
      elapsedTime += 1;
      setChartData((prevData) => [...prevData, newDataPoint]);
      setElapsedTime((prevElapsedTime) => prevElapsedTime + 1);
    }
  };

  useEffect(() => {
    if (isPlaying) {
      setIsPlaying(true)
      const interval = setInterval(updateChart, 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [isPlaying]);

  // const toggleChart = () => {
  //   if (isRunning) {
  //     stopTimer();
  //   } else {
  //     startTimer();
  //   }
  // };

  const toggleChart = () => {
    if (!isPlaying) {
      // If the chart is stopped, start it
      setIsPlaying(true);
      setIsTimerRunning(true); // Timer will start when the chart starts
      setCounter(-1);
      elapsedTime = -1;
      updateChart();
  
      // Create a new WebSocket connection when starting the chart
      const newSocket = new WebSocket(`wss:/api-h5zs.onrender.com/ws`);
      newSocket.onmessage = (event) => {
        console.log(event, "event");
        const newData = JSON.parse(event.data);
        console.log(newData, "newData");
        const seriesCount = newData.series;
        // seriesCount = Updated_data.length
        for (let i = 0; i < seriesCount.length; i += 20) {
          const slice = seriesCount.slice(i, i + 10);
          const mappedSlice = slice.map((val, index) => ({
            index: i + index,
            val: parseFloat(val),
          }));
          metricArray.push(...mappedSlice);
          console.log(metricArray, "metrics");
          // setmetricArray(mappedSlice)
        }
        console.log(metricArray);
        return metricArray;
      };
      newSocket.onopen = () => {
        console.log("Socket open");
      };
      newSocket.onclose = () => {
        console.log("Socket close");
      };
  
      setSocket(newSocket); // Set the socket state to the new WebSocket instance
  
      if (!timerRef.current) {
        timerRef.current = setInterval(updateChart, 1000);
      }
  
      setTimeout(() => {
        setIsTimerRunning(false);
        setIsPlaying(false)
        clearInterval(timerRef.current);
        timerRef.current = undefined;
        setProgress(0);
        if (newSocket) {
          newSocket.close();
          setSocket(null);
          setCounter(-1);
          setmetricArray([]);
        }
      }, 61500); // 120000 milliseconds = 2 minutes
      flag = 0;
      setData([]);
    } else {
      // If the chart is running, stop it
      setIsPlaying(false);
      setIsTimerRunning(false); // Stop the timer
      clearInterval(timerRef.current);
      timerRef.current = undefined;
      flag = 0;
      setProgress(0); // Reset the progress bar
  
      if (socket) {
        socket.close();
        setSocket(null);
        setCounter(-1);
        setmetricArray([]);
      }
    }
  };
  

  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible((prevVisible) => !prevVisible);
  };

  useEffect(() => {
    if (status) {
      console.log(user);
    }
  }, [status]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [metrics]);

  const chartRef = useRef(null);
  const downloadAsPdf = async () => {
    try {
      const chartContainer = chartRef.current;

      const canvas = await html2canvas(chartContainer, {
        scale: 2,
      });

      const imgData = canvas.toDataURL("image/jpeg");

      const pdf = new jsPDF();
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("chart.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  useEffect(() => {
    let interval;

    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prevProgress) => prevProgress + 100 / timer);
        // console.log("Progress",progress);
        setTimer((prevTimer) => prevTimer - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => {
      clearInterval(interval);
    };
  }, [isPlaying, timer]);

  useEffect(() => {
    if (timer <= 0) {
      setIsPlaying(false);
      setDownloadEnabled(true);
    }
  }, [timer]);

  const downloadGraph = () => {
    // Replace this with actual logic to download the graph image
    alert("Download the graph image here");
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);

    // Toggle Bluetooth connection status
    if (isPlaying) {
      setIsBluetoothConnected(false); // Disconnected when pausing
    } else {
      setIsBluetoothConnected(true); // Connected when playing
    }
  };

  return (
    <>
      <header class="fixed w-full">
        <nav class="bg-gray-100 border-gray-500 py-1 dark:bg-gray-900">
          <div class="flex flex-wrap items-center justify-between max-w-screen-xl px-4 mx-auto">
            <a href="#" class="flex items-center">
              <img src={Logo} class="h-6 mr-3 sm:h-9" alt="Landwind Logo" />
            </a>
            <div class="flex items-center lg:order-2">
              <div className="relative">
                <button
                  id="avatarButton"
                  type="button"
                  onClick={() => setDropdownVisible(!isDropdownVisible)}
                  className="w-10 h-10 rounded-full cursor-pointer"
                >
                  <img
                    src={Profile}
                    alt="User dropdown"
                    className="object-cover w-full h-full rounded-full"
                  />
                </button>
                {isDropdownVisible && (
                  <div
                    id="userDropdown"
                    className="absolute top-12 right-0 z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-44 dark:bg-gray-700 dark:divide-gray-600"
                  >
                    <div className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      <div>{}</div>
                      <div className="font-medium truncate">
                        bonnie@gmail.com
                      </div>
                    </div>
                    <ul
                      className="py-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
                      aria-labelledby="avatarButton"
                    >
                      <li
                        onClick={() => setDropdownVisible(!isDropdownVisible)}
                      >
                        <a
                          onClick={() => {
                            setDropdownVisible(!isDropdownVisible);
                            localStorage.setItem("isLoggedIn", false);
                            localStorage.setItem("user", null);
                            console.clear();
                            navigate("/");
                          }}
                          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                        >
                          Dashboard
                        </a>
                      </li>
                    </ul>
                    {/* <ul
                      className="py-2 text-sm text-gray-700 dark:text-gray-200 cursor-pointer"
                      aria-labelledby="avatarButton"
                    >
                      <li
                        onClick={() => setDropdownVisible(!isDropdownVisible)}
                      >
                        <a
                          onClick={() => {
                            setDropdownVisible(!isDropdownVisible);
                            console.clear();
                            navigate("/live");
                            window.location.reload();
                          }}
                          className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer"
                        >
                          Live Data
                        </a>
                      </li>
                    </ul> */}
                    <div className="py-1">
                      <a
                        onClick={() => {
                          setDropdownVisible(!isDropdownVisible);
                          localStorage.setItem("isLoggedIn", false);
                          localStorage.setItem("user", null);
                          console.clear();
                          navigate("/login");
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white cursor-pointer"
                      >
                        Sign out
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      </header>
      <div className="flex flex-col justify-center items-center bg-gradient-to-r from-cyan-100 to-cyan-500 ">
        <ToastContainer
          position="top-right"
          autoClose={7000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />

        <ToastContainer />

        {/* First Section */}
        <div className="w-full p-12 flex flex-col gap-10 md:flex-row mt-8">
          {/* Left Side (Image Frame) */}
          <div className="w-80 h-72 bg-cyan-200 rounded-2xl shadow-2xl mb-4 md:mb-0">
            <img
              src={Fit}
              alt="fit"
              className="w-full h-full object-cover rounded-3xl p-3"
            />
          </div>

          {/* Right Side (Heading and Paragraph) */}
          <div className="md:ml-8">
            <h1 className="text-5xl font-semibold font-sans">MOVEMENT</h1>
            <br />
            <p className="text-black text-2xl font-sans">
              Keep your head straight and your neck relaxed.
              <br /> Relax your shoulders and keep them back and down.
              <br /> Bend your arms at 90 angle and keep your hands relaxed.
              <br /> Lean forward slightly without bending the waist.
              <br /> Avoid Lifting your knees too high.
            </p>
          </div>
        </div>

        {/* Toggle Button */}
        {/* <button
        className={`mt-4 bg-blue-500 text-white px-4 py-2 rounded-lg`}
        onClick={togglePlay}
      >
        {isPlaying ? 'Pause' : 'Play'}
      </button> */}

        <div
          onClick={() => setisLeg(!isLeg)}
          className={classNames(
            "flex w-20 h-10 bg-gray-600 mt-4 rounded-full transition-all duration-500 cursor-pointer",
            { "bg-green-500": isLeg }
          )}
        >
          <span
            className={classNames(
              "h-10 w-10 text-3xl font-extrabold text-center my-auto bg-white rounded-full transition-all duration-500 shadow-lg cursor-pointer",
              { "ml-10": isLeg }
            )}
          >
            {isLeg ? "R" : "L"}
          </span>
        </div>

        {/* Glass Morphic Section */}
        <div className="w-3/4 h-[55rem] my-8 relative border-1 bg-opacity-30 bg-white shadow-xl backdrop-blur-3xl backdrop-brightness-90 rounded-3xl">
          {/* Toggle Button (Top Left) */}
          <button
            className={`m-2 flex items-center justify-center w-12 h-12 rounded-full bg-blue-500 text-white ${
              isPlaying ? "bg-red-500" : "bg-green-500"
            }`}
            onClick={handleClick}
          >
            {isPlaying ? <FaPause /> : <FaPlay />}
          </button>

          {/* Bluetooth Connection (Top Right) */}
          <div className="absolute top-4 right-4 flex items-center">
            <div
              className={`w-4 h-4 rounded-full mr-2 ${
                isBluetoothConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></div>
            <span>{isBluetoothConnected ? "Connected" : "Disconnected"}</span>
          </div>

          {/* Graph Import Area (Below) */}
          <div className="mt-6 mx-4">
            {/* Add your graph import area here */}
            {/* Example: <input type="file" accept=".png, .jpg, .jpeg" /> */}

            <div className="w-full p-2 mb-4 flex flex-col">
              {/* Same as */}

              <div
                className="flex flex-col items-center justify-start pb-1 pr-5 rounded w-full h-[700px]"
                ref={chartRef}
              >
                {isTimerRunning && <Timer sock={socket}/>}
                <ResponsiveContainer width="100%" height="80%">
                  <LineChart data={data} className={"mx-auto"}>
                    <Tooltip
                      cursor={false}
                      wrapperStyle={{
                        backgroundColor: "transparent",
                        padding: "5px",
                        borderRadius: 4,
                        overflow: "hidden",
                        fill: "black",
                        boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
                      }}
                      LabelStyle={{ color: "black" }}
                      itemStyle={{ color: "black" }}
                    />
                    <XAxis dataKey="index" type="category">
                      <Label
                        dy={10}
                        value="Time"
                        domain={[1, elapsedTime + 20]}
                        position="insideBottom"
                        style={{ textAnchor: "middle" }}
                        tick={{ fill: "black" }}
                        ticks={[1, 20, 40, 60, 80, 100, 120]}
                      />
                    </XAxis>
                    <YAxis>
                      <Label
                        angle={-90}
                        value="Angle"
                        position="insideLeft"
                        style={{ textAnchor: "middle" }}
                        tick={{ fill: "black" }}
                      />
                    </YAxis>
                    <Line
                      dataKey="val"
                      fill="black"
                      type="monotone"
                      dot={{ fill: "yellow", r: 5 }}
                      strokeWidth={3}
                      stackId="2"
                      stroke="purple"
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <br></br>
              <div className="flex justify-center">
                <button
                  onClick={downloadAsPdf}
                  className={`
      w-1/4 h-12 text-xl my-auto 
      bg-gradient-to-r from-purple-500 to-blue-500
      hover:from-purple-600 hover:to-blue-600
      text-white font-bold mx-auto rounded-2xl
      border-2 border-white
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
      transform hover:scale-105 transition-transform duration-300 ease-in-out
    `}
                  disabled={isPlaying}
                >
                  {isPlaying
                    ? "Cannot Download Chart"
                    : "Download Chart as PDF"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* <Live/> */}
    </>
  );
};

export default Diagno;
