function PreviewTest(props){
    const {data, onClose} = props;
    return(
        <>
          <div className="preview container">
                {data.map((item, index)=>(
                <div className="row" key={index}>
                  <h5>Câu {index + 1}</h5>
                  <p className="preview__question">{item.content}</p>
                  {item.type === 1 && (
                    <>
                      <i>Câu hỏi 1 đáp án</i>
                      {item.answer.map((ans, i) =>(
                        <div key={i}>
                          <input type="radio" readOnly></input>
                          <span>{ans.content}</span>
                        </div>
                      ))}
                    </>
                  )}
                  {item.type === 2 && (
                    <>
                      <i>Câu hỏi nhiều đáp án</i>
                      {item.answer.map((ans, i) =>(
                        <div key={i}>
                          <input type="checkbox" readOnly></input>
                          <span>{ans.content}</span>
                        </div>
                      ))}
                    </>
                  )}
                  {item.type === 3 && (
                    <>
                      <i>Câu hỏi điền đáp án</i>
                      <p>{item.answer[0]?.content || ""}</p>
                    </>
                  )}
                </div>
            ))}
          </div>
        </>
    );
}

export default PreviewTest;