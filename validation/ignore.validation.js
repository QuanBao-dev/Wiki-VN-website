const ignoreProps = (props = [], data) =>{
  const dataVm = {}
  const keys = Object.keys(data);
  keys.forEach((key) =>{
    if(!props.includes(key)){
      dataVm[key] = data[key]
    }
  })
  return dataVm
}

module.exports = ignoreProps;