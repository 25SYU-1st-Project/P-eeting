import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import searchIcon from '../images/search.png';
import './MainPage.css';

import firstIcon from '../images/first.png';
import prevIcon from '../images/prev.png';
import nextIcon from '../images/next.png';
import lastIcon from '../images/last.png';
import plusIcon from '../images/plusIcon.png';

//firebase 임포트
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from "firebase/firestore";
import { Timestamp, collection, getDocs } from "firebase/firestore";
import { auth, db } from '../firebase';

Modal.setAppElement('#root');

function MainPage() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedTracks, setSelectedTracks] = useState([]);
  const [age, setAge] = useState("");
  const [error, setError] = useState("");
  const [signupSuccess, setSignupSuccess] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false); // 로그인 상태 추가
  const [currentUser, setCurrentUser] = useState(null); // 현재 로그인한 사용자 정보

  //라우터 핸들러
  const navigate = useNavigate();
  const handleProjButton = () => {
    navigate('/projectWrite')
  }


  // 그리드에 표시되는 포스트들, 페이징 버튼
  const [posts, setPosts] = useState([]);

  const postsPerPage = 6;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(posts.length / postsPerPage);
  const maxPageButtons = 5;

  const getPageNumbers = () => {
    const pageGroup = Math.floor((currentPage - 1) / maxPageButtons) * maxPageButtons;
    const startPage = pageGroup + 1;
    const endPage = Math.min(startPage + maxPageButtons - 1, totalPages);

    return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  };

  const currentPosts = posts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handleClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleFirstPage = () => {
    setCurrentPage(1);
  };

  const handleLastPage = () => {
    setCurrentPage(totalPages);
  };

  const handlePrevPage = () => {
    setCurrentPage(prev => (prev > 1 ? prev - 1 : 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => (prev < totalPages ? prev + 1 : totalPages));
  };

  //모달 함수
  const [loginModalIsOpen, setLoginModalIsOpen] = useState(false);
  const [signupModalIsOpen, setSignupModalIsOpen] = useState(false);

  const openLoginModal = () => {
    setLoginModalIsOpen(true);
  };

  const closeLoginModal = () => {
    setLoginModalIsOpen(false);
  };

  const openSignupModal = () => {
    setSignupModalIsOpen(true);
    setLoginModalIsOpen(false);
  };

  const closeSignupModal = () => {
    setSignupModalIsOpen(false);
  };

  //트랙 선택 드롭다운 함수
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const trackOptions = ['디자이너', 'BE 개발자', 'FE 개발자', 'PM'];

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev);
  };

  const handleTrackSelect = (track) => {
    setSelectedTracks((prev) =>
      prev.includes(track) ? prev.filter((item) => item !== track) : [...prev, track]
    );
  };

  // 로그인 함수
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // 기존 에러 초기화

    if (!email || !password) {
      setError("이메일과 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      setIsLoggedIn(true); // 로그인 상태 변경
      setCurrentUser(user); // 현재 사용자 설정
      setLoginModalIsOpen(false); // 로그인 모달 닫기
      setEmail('');
      setPassword('');
      console.log('로그인 성공:', user);
    } catch (err) {
      setError(`로그인 실패: ${err.message}`);
    }
  };

  // 로그아웃 함수
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false); // 로그인 상태 해제
      setCurrentUser(null); // 현재 사용자 초기화
      console.log('로그아웃 성공');
    } catch (err) {
      console.error('로그아웃 실패:', err.message);
    }
  };

  //회원가입 함수
  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword || !age || selectedTracks.length === 0) {
      setError("모든 필드를 채워주세요.");
      return;
    }

    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (isNaN(age) || age <= 0) {
      setError("유효한 나이를 입력하세요.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        email,
        age: parseInt(age, 10),
        tracks: selectedTracks,
        appliedProjects: [],
        joinedProjects: [],
        profileImage: "",
        resume: "",
        name: "",
      });

      setSignupSuccess(true);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setAge("");
      setSelectedTracks([]);
    } catch (err) {
      setError(`회원가입 실패: ${err.message}`);
    }
  };

  //애니메이션
  const slides = [
    { color: "#000000", text: "LIKELION 13기 모집중", target: "#" },
    { color: "#000000", text: "1팀 장준익 유광렬 정서우 ", target: "#" },
    { color: "#000000", text: "강승진 강사님 화이팅", target: "#" },
    { color: "#000000", text: "삼육대 컴공 4학년 화이팅", target: "#" },
    { color: "#000000", text: "잼띵이 유튜브 구독!!", target: "#" },
    { color: "#000000", text: "우리 모두 잘 취직해보아요", target: "#" },
    { color: "#000000", text: "P-EETING은 최고야!", target: "#" },
  ];

  const [animate, setAnimate] = useState(true);
  const onStop = () => setAnimate(false);
  const onRun = () => setAnimate(true);


  //포스트 Get함수
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}.${month}.${day}`;
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const fetchedProjects = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        fetchedProjects.sort((a, b) => b.createdAt - a.createdAt);
        setPosts(fetchedProjects);
      } catch (error) {
        console.error("프로젝트 데이터를 가져오는 중 오류:", error);
      }
    };

    fetchProjects();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState("전체");

  // 카테고리별 필터링 함수
  const filteredPosts = selectedCategory === "전체"
    ? posts
    : posts.filter(post => post.category === selectedCategory);

  const currentFilteredPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  return (
    <div className="MainPage-container">
      <div className="MainPage-Header">
        <div className="MainPage-Header-Left">
          <div className="MainPage-Header-LOGO"><span>P</span>-eeting</div>
          <div className="MainPage-Header-Search">
            <div className="MainPage-Header-SearchIcon"><img src={searchIcon} alt="돋보기아이콘" /></div>
            <input className="MainPage-Header-InputArea" type="text" placeholder="프로젝트 미팅, 피팅" />
          </div>
        </div>
        <div className="MainPage-Header-Right">
          <div className="MainPage-Header-Right-ProMatch">프로젝트 매칭</div>
          <div className="MainPage-Header-Right-FreeMatch">프리랜서 매칭</div>
          <div className="MainPage-Header-Right-MyProject">마이 프로젝트</div>
          {isLoggedIn ? (
            <div className="MainPage-Header-Right-LogoutButton" onClick={handleLogout}>
              로그아웃
            </div>
          ) : (
            <div className="MainPage-Header-Right-LoginButton" onClick={() => setLoginModalIsOpen(true)}>
              로그인
            </div>
          )}
        </div>
      </div>
      <div className="MainPage-Contents">
        <div className="MainPage-Contents-header">
          <div className="MainPage-Contents-header-title">프로젝트 목록</div>
          <div className="MainPage-Contents-header-category">
            {["전체", "문화 · 스포츠", "금융 · 보험", "의료서비스", "건설 · 건축"].map((category) => (
              <div
                key={category}
                className={`MainPage-Contents-header-category-item ${selectedCategory === category ? "active" : ""
                  }`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </div>
            ))}
          </div>
        </div>
        <div className="MainPage-Contents-body">
          {currentFilteredPosts.map((post, index) => (
            <div key={index} className="MainPage-Contents-item">
              <div className="MainPage-Contents-item-poster">
                {formatDate(post.createdAt)}
              </div>
              <div className="MainPage-Contents-item-contents">
                <div className="MainPage-Contents-item-left">
                  <div className="MainPage-Contents-item-projectInfo">
                    <div className="MainPage-Contents-item-projectCreator">{post.creatorId}</div>
                    <div className="MainPage-Contents-item-projectTitle">{post.name}</div>
                  </div>
                  <div className="MainPage-Contents-item-stacks">
                    {post.tracks.map((track, index) => (
                      <span key={index}># {track} </span>
                    ))}
                  </div>
                </div>

                <div className="MainPage-Contents-item-right">
                  <div className="MainPage-Contents-item-Date">
                    <div className="MainPage-Contents-item-DateTitle">모집 기간</div>
                    <div className="MainPage-Contents-item-Deadline">
                      <div className="MainPage-Contents-item-DeadlineFrom">{formatDate(post.deadLine[0])}</div>
                      <div className="MainPage-Contents-item-~">~</div>
                      <div className="MainPage-Contents-item-DeadlineTo">{formatDate(post.deadLine[1])}</div>
                    </div>
                  </div>
                  <div className="MainPage-Contents-item-CategoryReward">
                    <div className="MainPage-Contents-item-Category">{post.category}</div>
                    <div className="MainPage-Contents-item-Reward"><span>1인</span> {post.salary} 만원</div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="MainPage-Contents-createProjButton" onClick={handleProjButton}>
            <img src={plusIcon} />
          </div>
        </div>
      </div>
      <div className="pagination">
        <button onClick={handleFirstPage}>
          <img src={firstIcon} alt="First" width="20" height="20" />
        </button>
        <button onClick={handlePrevPage}>
          <img src={prevIcon} alt="Previous" width="20" height="20" />
        </button>
        {getPageNumbers().map((pageNumber) => (
          <button
            key={pageNumber}
            onClick={() => handleClick(pageNumber)}
            className={pageNumber === currentPage ? 'active' : ''}
          >
            {pageNumber}
          </button>
        ))}
        <button onClick={handleNextPage}>
          <img src={nextIcon} alt="Next" width="20" height="20" />
        </button>
        <button onClick={handleLastPage}>
          <img src={lastIcon} alt="Last" width="20" height="20" />
        </button>
      </div>
      <div className="AdSlide">
        <div className="slide_container">
          <ul
            className="slide_wrapper"
            onMouseEnter={onStop}
            onMouseLeave={onRun}
          >
            <div
              className={"slide original".concat(
                animate ? "" : " stop"
              )}
            >
              {slides.map((s, i) => (
                <li
                  key={i}
                  className={i % 2 === 0 ? "big" : "small"}
                >
                  <div
                    className="item"
                    style={{ background: s.color }}
                  >
                    <span className="slide-text">{s.text}</span>
                  </div>
                </li>
              ))}
            </div>
            <div
              className={"slide clone".concat(animate ? "" : " stop")}
            >
              {slides.map((s, i) => (
                <li
                  key={i}
                  className={i % 2 === 0 ? "big" : "small"}
                >
                  <div
                    className="item"
                    style={{ background: s.color }}
                  >
                    <span className="slide-text">{s.text}</span>
                  </div>
                </li>
              ))}
            </div>
          </ul>
        </div>
      </div>
      <Modal
        isOpen={loginModalIsOpen}
        onRequestClose={closeLoginModal}
        contentLabel="로그인"
        className="modal1"
        overlayClassName="overlay"
      >
        <div className="modal1-content">
          <div className="modal1-content-loginTitle">로그인</div>
          <form className="modal1-content-loginContents" onSubmit={handleLogin}>
            <input
              className="modal1-content-Email"
              type="email"
              placeholder="이메일"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="modal1-content-Password"
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {error && <div className="modal1-content-error">{error}</div>}
          </form>
          <div className="modal1-content-joinSuggestion">
            <div className="modal1-content-openJoin1">P-eeting이 처음이라면?</div>
            <div className="modal1-content-openJoin2" onClick={openSignupModal}>회원가입하기</div>
          </div>
          <div className="modal1-content-loginButton" onClick={handleLogin}>로그인</div>
        </div>
      </Modal>

      <Modal
        isOpen={signupModalIsOpen}
        onRequestClose={closeSignupModal}
        contentLabel="회원가입"
        className="modal2"
        overlayClassName="overlay"
      >
        <div className="modal2-content">
          <div className="modal2-content-joinTitle">회원가입</div>
          {signupSuccess ? (
            <div className="modal2-content-success">회원가입이 완료되었습니다!</div>
          ) : (
            <form className="modal2-content-joinContents" onSubmit={handleSignup}>
              <input
                className="modal2-content-Email"
                type="email"
                placeholder="이메일"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <input
                className="modal2-content-Password"
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                className="modal2-content-Password2"
                type="password"
                placeholder="비밀번호 확인"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <div className="modal2-content-Track">
                <button
                  type="button"
                  className={`modal2-content-Track-Dropdown ${selectedTracks.length === 0 ? 'placeholder' : ''}`}
                  onClick={toggleDropdown}
                >
                  {selectedTracks.length > 0
                    ? `${selectedTracks.join(', ')}`
                    : '트랙 선택'}
                </button>
                {isDropdownOpen && (
                  <ul className="dropdown-list">
                    {trackOptions.map((track, index) => (
                      <li
                        key={index}
                        className={`dropdown-item ${selectedTracks.includes(track) ? 'selected' : ''}`}
                        onClick={() => handleTrackSelect(track)}
                      >
                        {track}
                      </li>
                    ))}
                  </ul>
                )}
                <input
                  className="modal2-content-Age"
                  type="text"
                  placeholder="나이"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>

              {error && <div className="modal2-content-error">{error}</div>}
              <button type="submit" className="modal2-content-joinButton">회원가입</button>
            </form>
          )}
        </div>
      </Modal>
    </div >
  )
}

export default MainPage
