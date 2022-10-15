import './Home.css';


import CardListVN from '../../components/CardListVN/CardListVN';
import SearchVN from '../../components/SearchVN/SearchVN';

const Home = () => {
  return (
    <div className="app-wrapper">
      {/* <SkeletonLoading
        LoadingComponent={<div />}
        height={300}
        width={300}
        isLoading={true}
        margin={50}
      /> */}
      <SearchVN />
      <CardListVN />
    </div>
  );
};

export default Home;
