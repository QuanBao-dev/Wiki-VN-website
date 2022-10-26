import './Home.css';


import CardListVN from '../../components/CardListVN/CardListVN';
import SearchVN from '../../components/SearchVN/SearchVN';

const Home = () => {
  return (
    <div className="app-wrapper">
      <SearchVN />
      <CardListVN />
    </div>
  );
};

export default Home;
