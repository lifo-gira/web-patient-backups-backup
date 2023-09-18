import React, { useState } from "react";
import { useRef } from "react";
import { useEffect } from "react";
import Spinner from "../assets/Spinner";
import Profile from "../assets/profile.jpg";
import Logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

const Live = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState(localStorage.getItem("isLoggedIn"));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const userId = user.user_id;
  const messagesEndRef = useRef(null);
  const [patient, setPatient] = useState();
  const [metrics, setMetrics] = useState([]);
  const [datametrics, setdatametrics] = useState([]);
  const [seriesmetrics, setseriesmetrics] = useState([]);
  const [autoScroll, setAutoScroll] = useState(false);
  const [filteredData, setFilteredData] = useState([]);
  const [metricArray, setmetricArray] = useState([]);
  const [seriesCount, setseriesCount] = useState([]);

  const tempArray = [];
  var flag = 0;

  useEffect(() => {
    if (status) {
      console.log(user);
    }
  }, [status]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  async function fetchData() {
    fetch(`https://api-h5zs.onrender.com/get-user/patient/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setPatient(data);
        // sereiesMetrics(data.data).then((metrics) => {
        //   setMetrics(metrics);
        // });
        fetchMetrics(data.data).then((metrics) => {
          setMetrics(metrics);
          seriesCount.push(metrics.length);
          // console.log(flag,"flag")
          for (var i = 0; i < metrics.length; i++) {
            if (metrics[i].series != "")
              for (var j = 0; j < metrics[i].series.length; j++) {
                seriesmetrics.push(parseInt(metrics[i].series[j]));
              }
          }
          setseriesmetrics(seriesmetrics);
          setdatametrics(metrics.map((item) => item.data_id));
        });
        setInterval(() => {
          fetchMetrics(data.data).then((metrics) => {
            setMetrics(metrics);
            setFilteredData(() => {
              let temp = metrics.map((item) => {
                const series = item.series;
                // console.log(series,"ASDAS")
                if (flag < seriesCount[0]) {
                  for (let i = 0; i < series.length; i += 10) {
                    const slice = series.slice(i, i + 10);
                    const mappedSlice = slice.map((val, index) => ({
                      index: i + index,
                      val: parseInt(val),
                    }));
                    // console.log(slice, "mapped")
                    metricArray.push(...mappedSlice);
                    console.log(metricArray,"metric")
                  }
                  flag = flag + 1;
                }
                return tempArray;
              });
              return temp;
            });
          });
        }, 5000);
      })
      .catch((err) => {
        console.log(err);
      });
    return () => {
      clearInterval();
    };
  }

  // async function sereiesMetrics(data) {
  //   const response = await fetch("https://api-h5zs.onrender.com/metrics", {
  //     method: "POST",
  //     cache: "no-cache",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(data),
  //   });
  //   return response.json();
  // }

  async function fetchMetrics(data) {
    const response = await fetch("https://api-h5zs.onrender.com/metrics", {
      method: "POST",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  useEffect(() => {
    if (autoScroll) {
      scrollToBottom();
    }
  }, [metrics]);

  useEffect(() => {
    fetchData();
    const tpr = setInterval(fetchData, 1000);
    return () => {
      clearInterval(tpr);
    };
  }, []);

  const [isDropdownVisible, setDropdownVisible] = useState(false);

  const toggleDropdown = () => {
    setDropdownVisible((prevVisible) => !prevVisible);
  };
  if (status) {
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
                              console.clear();
                              navigate("/diagnostics");
                            }}
                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                          >
                            Graph
                          </a>
                        </li>
                      </ul>
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
        <div className="h-full w-full bg-gradient-to-r from-cyan-100 to-cyan-500">
          {patient != null && userId != "" && (
            <div className="w-full h-full flex flex-col items-center p-20">
              <div className="w-full mb-4 flex flex-col items-center bg-gradient-to-r from-cyan-100 to-cyan-500">
                <div>
                  <p class="max-w-2xl mb-6 font-bold text-black text-5xl lg:mb-8 md:text-3xl lg:text-xl dark:text-black">
                    The below window contains all the data fetched from the
                    device.
                  </p>
                </div>
                <div className="w-full h-full bg-black text-white mx-4 rounded-2xl shadow-2xl ">
                  {/* Replace with your log data content */}
                  <div
                    className="w-full h-full bg-black text-green-500 rounded-2xl p-3 font-mono shadow-2xl border-2"
                    key={userId}
                  >
                    <ul>
                      {metrics
                        .slice(-100)
                        .reverse()
                        .map((val, i) => (
                          <li key={i}>
                            ${i}: {val.data_id}
                            <ul className="indent-10">
                              <li>{val.device_id}</li>
                              <li>{JSON.stringify(val.series)}</li>
                            </ul>
                          </li>
                        ))}
                      <div ref={messagesEndRef} />
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
          {patient == null && userId != "" && <Spinner />}
        </div>
      </>
    );
  } else {
    return <div>You do not have permission to access this page</div>;
  }
};

export default Live;
