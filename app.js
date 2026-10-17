
const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "denkikouji_5choice_history_v1";

const categoryNames = {
  circuit:"RLC直列回路",
  transformer:"変圧器・一次電流",
  short:"三相短絡電流",
  tension:"架空配電線路・水平張力",
  law:"建設業法",
  electricity:"電気事業法"
};

function shuffle(a){
  const x=[...a];
  for(let i=x.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [x[i],x[j]]=[x[j],x[i]];
  }
  return x;
}
function round(n,d=1){const p=10**d;return Math.round(n*p)/p}
function fmt(n,d=1){return Number(round(n,d)).toLocaleString("ja-JP",{maximumFractionDigits:d})}
function nearChoices(correct, factors=[.8,.9,1.1,1.2]){
  const vals=[correct,...factors.map(f=>correct*f)].map(v=>round(v,1));
  return [...new Set(vals)].slice(0,5).map(v=>`${fmt(v,1)}`);
}
function q(id,category,text,choices,answer,explanation,note=""){
  return {id,category,text,choices,answer,explanation,note};
}

/* ---------------------------
   固定問題
--------------------------- */
const fixedQuestions = [
  q("rlc-concept-1","circuit",
    "RLC直列回路で、抵抗R・誘導リアクタンスXL・容量リアクタンスXCからインピーダンスZを求める式として正しいものはどれか。",
    ["Z = √(R² + (XL − XC)²)","Z = R + XL + XC","Z = √(R² + XL² + XC²)","Z = R(XL − XC)","Z = (XL − XC) / R"],
    "Z = √(R² + (XL − XC)²)",
    "直列RLC回路では、リアクタンス成分は XL − XC です。したがって Z = √{R² + (XL − XC)²} となります。"
  ),
  q("rlc-concept-2","circuit",
    "RLC直列回路が直列共振しているときの関係として正しいものはどれか。",
    ["XL = XC","XL > XC","XL < XC","R = 0","Z = 0"],
    "XL = XC",
    "直列共振では XL = XC となり、リアクタンス成分が相殺されます。このとき回路のインピーダンスは R になります。"
  ),
  q("transformer-concept-1","transformer",
    "一次側が単相2線式、二次側が三相3線式の変圧器で、二次側三相負荷の有効電力P、力率cosφ、一次電圧V1が与えられ、変圧器等の損失を無視する。一次電流I1を求める基本的な考え方として正しいものはどれか。",
    ["二次負荷の皮相電力S=P/cosφを求め、I1=S/V1とする","I1=P/(√3V1cosφ)とする","I1=P/V1とし、力率は無視する","I1=√3P/V1とする","二次電圧だけでI1を求める"],
    "二次負荷の皮相電力S=P/cosφを求め、I1=S/V1とする",
    "一次側が単相2線式なので、一次側では S = V1 I1。二次側負荷から総皮相電力を求め、損失無視なら一次側皮相電力と等しいとして I1 = S/V1 とします。"
  ),
  q("short-concept-1","short",
    "想定短絡点の三相短絡電流を％インピーダンス法で求める場合の基本手順として最も適切なものはどれか。",
    ["短絡点までの各％インピーダンスを共通の基準容量に換算して合成し、基準電流から短絡電流を求める",
     "各機器の定格電流を単純に加算する",
     "短絡点の電圧を各％インピーダンスの最大値だけで割る",
     "変圧器の％インピーダンスだけを使用し、配電線路は常に無視する",
     "負荷の有効電力だけから短絡電流を求める"],
    "短絡点までの各％インピーダンスを共通の基準容量に換算して合成し、基準電流から短絡電流を求める",
    "％インピーダンスは基準容量をそろえてから合成します。短絡点から電源側を見た合成％インピーダンスを使って短絡容量・短絡電流を算出します。"
  ),
  q("tension-concept-1","tension",
    "架空配電線路の電線に作用する水平張力が最大になりやすい条件として、一般に最も注意すべきものはどれか。",
    ["低温時や着氷雪・風圧などで電線荷重が大きくなる条件","無風で気温が高い条件","電線温度が最も高く弛度が大きい条件だけ","負荷電流がゼロの条件","支持物の接地抵抗が最小の条件"],
    "低温時や着氷雪・風圧などで電線荷重が大きくなる条件",
    "水平張力は温度低下による電線収縮や、着氷雪・風圧による荷重増加で大きくなります。問題では与えられた荷重条件・温度条件を比較します。"
  ),

  q("law-minor-1","law",
    "建設業法上、建設業の許可を受けなくても請け負うことができる「軽微な建設工事」の請負代金の額について、建築一式工事以外の工事は（　）未満である。",
    ["500万円","1,000万円","1,500万円","3,000万円","4,500万円"],
    "500万円",
    "建築一式工事以外では、請負代金の額が500万円未満の工事が軽微な建設工事に該当します。"
  ),
  q("law-minor-2","law",
    "建設業法上、建築一式工事で「軽微な建設工事」とされる請負代金の額の基準は（　）未満である。",
    ["1,500万円","500万円","1,000万円","2,000万円","4,500万円"],
    "1,500万円",
    "建築一式工事では、請負代金1,500万円未満という基準があります。木造住宅については延べ面積150m²未満という別の基準もあります。"
  ),
  q("law-minor-3","law",
    "建設業法上、建築一式工事において請負代金の額にかかわらず軽微な建設工事となり得る木造住宅の延べ面積は（　）未満である。",
    ["150m²","100m²","120m²","200m²","500m²"],
    "150m²",
    "延べ面積150m²未満の木造住宅工事は、軽微な建設工事の基準の一つです。"
  ),
  q("law-contract-1","law",
    "建設工事の請負契約の当事者は、各々の（　）における合意に基づいて公正な契約を締結しなければならない。",
    ["対等な立場","優越的な立場","発注者の立場","請負人の立場","行政の立場"],
    "対等な立場",
    "請負契約の当事者は、各々の「対等な立場」における合意に基づいて公正な契約を締結します。"
  ),
  q("law-contract-2","law",
    "建設工事の請負契約の当事者は、対等な立場における（　）に基づいて公正な契約を締結する。",
    ["合意","命令","慣例","入札","許可"],
    "合意",
    "条文の重要語句は「対等な立場」「合意」「公正な契約」「信義」「履行」です。"
  ),
  q("law-contract-3","law",
    "建設工事の請負契約の当事者は、対等な立場における合意に基づいて（　）を締結する。",
    ["公正な契約","随意契約","一方的な契約","口頭契約のみ","無償契約"],
    "公正な契約",
    "建設工事の請負契約では「公正な契約」を締結することが規定されています。"
  ),
  q("law-contract-4","law",
    "建設工事の請負契約の当事者は、（　）に従って誠実に契約を履行しなければならない。",
    ["信義","慣例","命令","利益","商慣習のみ"],
    "信義",
    "「信義に従って誠実にこれを履行しなければならない」という規定です。"
  ),
  q("law-contract-5","law",
    "建設工事の請負契約の当事者は、信義に従って誠実にこれを（　）しなければならない。",
    ["履行","破棄","変更","延期","転売"],
    "履行",
    "条文では「信義に従って誠実にこれを履行しなければならない」とされています。"
  ),
  q("law-period-1","law",
    "注文者は、その注文した建設工事を施工するために（　）と認められる期間に比して著しく短い期間を工期とする請負契約を締結してはならない。",
    ["通常必要","最短","法定","平均","請負人が希望"],
    "通常必要",
    "工期については「通常必要と認められる期間」が基準となります。"
  ),
  q("law-period-2","law",
    "注文者は、通常必要と認められる期間に比して（　）期間を工期とする請負契約を締結してはならない。",
    ["著しく短い","少し長い","同一の","著しく長い","任意の"],
    "著しく短い",
    "不当に短い工期の設定を禁止する規定で、キーワードは「著しく短い」です。"
  ),
  q("law-period-3","law",
    "注文者が、通常必要と認められる期間に比して著しく短い期間として設定してはならないものはどれか。",
    ["工期","保証期間","見積期間","入札期間","支払猶予期間"],
    "工期",
    "禁止されるのは、通常必要な期間に比して著しく短い「工期」を設定した請負契約です。"
  )
  ,
  q("law-subcontractor-1","law",
    "注文者は、請負人が選定した下請負人について、その建設工事の施工につき（　）と認められる下請負人があるときは、その変更を請求することができる。",
    ["著しく不適当","やや不適当","不経済","経験不足","遠隔地"],
    "著しく不適当",
    "重要語句は「著しく不適当」と認められる「下請負人」です。"
  ),
  q("law-subcontractor-2","law",
    "注文者は、著しく不適当と認められる（　）があるときは、その変更を請求することができる。",
    ["下請負人","主任技術者","注文者","監理技術者","発注担当者"],
    "下請負人",
    "対象となるのは、請負人が選定した「下請負人」です。"
  ),
  q("law-subcontractor-3","law",
    "著しく不適当と認められる下請負人があるとき、注文者が請負人に対して行うことができるものはどれか。",
    ["変更を請求","契約を自動解除","営業停止を命令","免許を取消し","工事を直接施工"],
    "変更を請求",
    "注文者は、その下請負人の「変更を請求」することができます。"
  ),
  q("law-subcontractor-4","law",
    "著しく不適当な下請負人の変更請求について、例外となるのは、あらかじめ注文者の（　）による承諾を得て選定した下請負人である。",
    ["書面","口頭","電話","黙示","電子メールのみ"],
    "書面",
    "あらかじめ注文者の「書面」による承諾を得て選定した下請負人については例外となります。"
  ),

  q("law-opinion-1","law",
    "元請負人が、請け負った建設工事を施工するために必要な（　）、作業方法その他元請負人において定めるべき事項を定めようとするときは、下請負人の意見を聴かなければならない。",
    ["工程の細目","請負金額","会社組織","就業規則","資本金"],
    "工程の細目",
    "対象となる事項には「工程の細目」「作業方法」などがあります。"
  ),
  q("law-opinion-2","law",
    "元請負人が工程の細目、（　）その他元請負人において定めるべき事項を定めようとするときは、下請負人の意見を聴かなければならない。",
    ["作業方法","給与体系","会社定款","入札資格","資本金"],
    "作業方法",
    "「工程の細目」「作業方法」が重要語句です。"
  ),
  q("law-opinion-3","law",
    "元請負人は、工程の細目や作業方法などを定めようとするとき、（　）下請負人の意見を聴かなければならない。",
    ["あらかじめ","工事完成後に","支払後に","検査後に","必要に応じて事後に"],
    "あらかじめ",
    "下請負人の意見は、事項を定める前に「あらかじめ」聴く必要があります。"
  ),
  q("law-opinion-4","law",
    "元請負人が工程の細目や作業方法などを定めようとするときに、あらかじめ聴かなければならないものはどれか。",
    ["下請負人の意見","注文者の同意のみ","行政庁の許可","近隣住民全員の同意","資材業者の承認"],
    "下請負人の意見",
    "元請負人は「あらかじめ下請負人の意見」を聴かなければなりません。"
  ),

  q("law-payment-1","law",
    "元請負人が請負代金の出来形部分に対する支払又は（　）における支払を受けたときは、下請負人に対する支払義務が生じる。",
    ["工事完成後","工事着手前","契約締結前","見積提出後","入札前"],
    "工事完成後",
    "出来形部分に対する支払、または「工事完成後」における支払が対象です。"
  ),
  q("law-payment-2","law",
    "元請負人が支払を受けた場合、その対象となった建設工事を施工した（　）に対して、所定の下請代金を支払わなければならない。",
    ["下請負人","注文者","設計者","監督官庁","資材メーカー"],
    "下請負人",
    "支払先は、対象となった建設工事を施工した「下請負人」です。"
  ),
  q("law-payment-3","law",
    "元請負人が支払を受けた場合、下請負人が施工した出来形部分に相応する（　）を支払わなければならない。",
    ["下請代金","保証金","入札保証金","違約金","許可手数料"],
    "下請代金",
    "出来形部分に相応する「下請代金」を支払います。"
  ),
  q("law-payment-4","law",
    "元請負人が出来形部分等の支払を受けた場合、下請負人への所定の支払は、支払を受けた日から（　）で、かつ、できる限り短い期間内に行わなければならない。",
    ["1月以内","10日以内","20日以内","2月以内","3月以内"],
    "1月以内",
    "支払期限は、元請負人が支払を受けた日から「1月以内」で、かつ、できる限り短い期間内です。"
  ),
  q("law-payment-5","law",
    "元請負人から下請負人への出来形部分等に対応する支払期間について、正しい組合せはどれか。",
    ["1月以内・できる限り短い期間内","20日以内・必ず20日目","2月以内・任意の期間","30営業日以内・できる限り長い期間","60日以内・支払時期は自由"],
    "1月以内・できる限り短い期間内",
    "「1月以内」で、かつ「できる限り短い期間内」がポイントです。"
  ),

  q("law-inspection-1","law",
    "元請負人が、下請負人から請け負った建設工事が完成した旨の（　）を受けたときは、所定期間内に完成確認の検査を完了しなければならない。",
    ["通知","許可","命令","請求書","見積書"],
    "通知",
    "起算の契機は、下請負人から工事完成の旨の「通知」を受けたときです。"
  ),
  q("law-inspection-2","law",
    "元請負人は、下請負人から工事完成の通知を受けた日から（　）で、かつ、できる限り短い期間内に完成確認の検査を完了しなければならない。",
    ["20日以内","10日以内","1月以内","30日以内","60日以内"],
    "20日以内",
    "完成確認の検査は、通知を受けた日から「20日以内」で、かつ、できる限り短い期間内に行います。"
  ),
  q("law-inspection-3","law",
    "下請負人から工事完成の通知を受けた元請負人が、所定期間内に行わなければならないものはどれか。",
    ["検査を完了","下請契約を解除","営業許可を申請","工期を延長","再入札を実施"],
    "検査を完了",
    "元請負人は完成を確認するための「検査を完了」しなければなりません。"
  ),

  q("law-engineer-1","law",
    "主任技術者及び監理技術者の職務に含まれるものとして、適切でないものはどれか。",
    ["会社の資本金の決定","施工計画の作成","工程管理","品質管理","技術上の指導監督"],
    "会社の資本金の決定",
    "職務には施工計画の作成、工程管理、品質管理、その他の技術上の管理、施工従事者への技術上の指導監督が含まれます。"
  ),
  q("law-engineer-2","law",
    "主任技術者及び監理技術者は、工事現場における建設工事を適切に実施するため、当該建設工事の（　）を行う。",
    ["施工計画の作成","会社定款の作成","入札制度の制定","資本金の変更","許可基準の制定"],
    "施工計画の作成",
    "主任技術者・監理技術者の重要職務の一つが「施工計画の作成」です。"
  ),
  q("law-engineer-3","law",
    "主任技術者及び監理技術者の職務として、施工計画の作成、工程管理、（　）、その他の技術上の管理が挙げられる。",
    ["品質管理","財務管理","人事評価","営業管理","株主管理"],
    "品質管理",
    "「施工計画の作成」「工程管理」「品質管理」「その他の技術上の管理」を押さえます。"
  ),
  q("law-engineer-4","law",
    "主任技術者及び監理技術者は、施工に従事する者に対する（　）の職務を誠実に行わなければならない。",
    ["技術上の指導監督","給与査定","採用面接","営業指導","契約金額の決定"],
    "技術上の指導監督",
    "施工従事者に対する「技術上の指導監督」も重要な職務です。"
  ),

  q("elec-safety-rule-1","electricity",
    "主務大臣は、事業用電気工作物の（　）、維持及び運用に関する保安を確保するため必要があると認めるとき、保安規程の変更を命ずることができる。",
    ["工事","販売","輸送","契約","検針"],
    "工事",
    "保安の対象となる基本語句は「工事、維持及び運用」です。"
  ),
  q("elec-safety-rule-2","electricity",
    "主務大臣が事業用電気工作物について確保するため、必要に応じて保安規程の変更を命ずることができるものはどれか。",
    ["保安","利益","売上","競争","料金収入"],
    "保安",
    "目的は、事業用電気工作物の工事、維持及び運用に関する「保安」の確保です。"
  ),
  q("elec-safety-rule-3","electricity",
    "主務大臣は、必要があると認めるとき、事業用電気工作物を（　）に対して保安規程を変更すべきことを命ずることができる。",
    ["設置する者","利用する全需要家","電気工事士全員","製造業者のみ","自治体のみ"],
    "設置する者",
    "命令の相手方は、事業用電気工作物を「設置する者」です。"
  ),
  q("elec-safety-rule-4","electricity",
    "主務大臣が、事業用電気工作物の保安確保のため必要があると認めるとき、設置者に対して命ずることができるものはどれか。",
    ["保安規程の変更","電気料金の値下げ","設備の無償譲渡","主任技術者免状の返納","工事会社の変更"],
    "保安規程の変更",
    "必要がある場合、主務大臣は「保安規程を変更すべきこと」を命ずることができます。"
  ),

  q("elec-chief-instruction-1","electricity",
    "事業用電気工作物の工事、維持又は運用に（　）は、主任技術者が保安のためにする指示に従わなければならない。",
    ["従事する者","見学する者","需要家全員","近隣住民","製造業者のみ"],
    "従事する者",
    "電気事業法では、工事、維持又は運用に「従事する者」に主任技術者の保安上の指示への服従義務があります。"
  ),
  q("elec-chief-instruction-2","electricity",
    "事業用電気工作物の工事、維持又は運用に従事する者は、主任技術者が（　）にする指示に従わなければならない。",
    ["その保安のため","利益確保のため","営業拡大のため","人事評価のため","料金設定のため"],
    "その保安のため",
    "従うべきものは、主任技術者が「その保安のためにする指示」です。"
  ),

  q("elec-plan-approval-1","electricity",
    "事業用電気工作物の設置又は変更の工事で、（　）上特に重要なものとして主務省令で定めるものをしようとする者は、工事計画について主務大臣の認可を受けなければならない。",
    ["公共の安全の確保","事業利益の確保","料金の安定","雇用の確保","地域振興"],
    "公共の安全の確保",
    "認可対象となる重要工事では「公共の安全の確保」がキーワードです。"
  ),
  q("elec-plan-approval-2","electricity",
    "公共の安全の確保上特に重要な事業用電気工作物の設置又は変更の工事について、主務大臣の（　）を受ける対象となるのは工事の計画である。",
    ["認可","届出受理だけ","口頭承諾","登録","免許交付"],
    "認可",
    "特に重要な工事については、その工事の「計画」について主務大臣の「認可」が必要です。"
  ),
  q("elec-plan-notice-1","electricity",
    "事業用電気工作物の設置又は変更の工事で、主務省令で定めるものをしようとする者は、その工事の（　）を主務大臣に届け出なければならない。",
    ["計画","請負金額","作業員名簿のみ","材料単価","会社定款"],
    "計画",
    "届出の対象は工事の「計画」です。"
  ),
  q("elec-plan-notice-2","electricity",
    "届出対象となる事業用電気工作物の工事計画について、その（　）をしようとするときも届出が必要である。",
    ["変更","印刷","保管","廃棄","複写"],
    "変更",
    "工事計画を変更しようとするときも同様に届出が必要です。"
  ),
  q("elec-plan-notice-3","electricity",
    "主務省令で定める事業用電気工作物の設置又は変更の工事について、工事計画を主務大臣に行う手続として正しいものはどれか。",
    ["届け出る","必ず認可を受ける","口頭報告のみ","市町村長に申請する","手続は不要"],
    "届け出る",
    "認可対象とは別に、主務省令で定める工事については工事計画の「届出」が必要です。"
  ),

  q("elec-license-1","electricity",
    "第一種電気主任技術者免状で保安の監督をすることができる電気設備の範囲として、基本的に正しいものはどれか。",
    ["事業用電気工作物の工事、維持及び運用","170,000V未満に限る","50,000V未満に限る","600V以下に限る","一般用電気工作物だけ"],
    "事業用電気工作物の工事、維持及び運用",
    "第一種は、電圧による上限なく事業用電気工作物の工事、維持及び運用の保安監督が可能です（省令上の除外設備を除く）。"
  ),
  q("elec-license-2","electricity",
    "第二種電気主任技術者免状で保安の監督をすることができる事業用電気工作物の電圧範囲は、原則として（　）未満である。",
    ["170,000V","50,000V","100,000V","200,000V","500,000V"],
    "170,000V",
    "第二種の範囲は「電圧170,000V未満」の事業用電気工作物です。"
  ),
  q("elec-license-3","electricity",
    "第三種電気主任技術者免状で保安の監督をすることができる事業用電気工作物の電圧範囲は、原則として（　）未満である。",
    ["50,000V","6,600V","22,000V","170,000V","500,000V"],
    "50,000V",
    "第三種は「電圧50,000V未満」が基本です。ただし、出力5,000kW以上の発電所又は蓄電所は除かれます。"
  ),
  q("elec-license-4","electricity",
    "第三種電気主任技術者免状の監督範囲から除かれるものとして正しいものはどれか。",
    ["出力5,000kW以上の発電所又は蓄電所","出力500kW以上の需要設備すべて","電圧6,600Vの需要設備すべて","電圧200Vの工場設備すべて","出力50kW以上の太陽電池設備すべて"],
    "出力5,000kW以上の発電所又は蓄電所",
    "現行の電気事業法施行規則では、第三種の範囲は50,000V未満ですが、「出力5,000kW以上の発電所又は蓄電所」は除外されています。"
  )

];

/* ---------------------------
   数値可変問題ジェネレータ
--------------------------- */
function genRLC(seed=0){
  const sets=[
    [30,40,20,100],[20,50,20,100],[40,30,60,200],[24,32,14,120],[50,80,50,250]
  ];
  const [R,XL,XC,V]=sets[Math.floor(Math.random()*sets.length)];
  const Z=Math.sqrt(R*R+(XL-XC)**2);
  const I=V/Z;
  const correct=`${fmt(I,2)} A`;
  const wrong=[
    `${fmt(V/(R+XL+XC),2)} A`,
    `${fmt(V/Math.sqrt(R*R+XL*XL+XC*XC),2)} A`,
    `${fmt(V/R,2)} A`,
    `${fmt(Z/V,2)} A`
  ];
  return q("rlc-calc-"+Date.now()+"-"+Math.random(),"circuit",
    `RLC直列回路で、R=${R}Ω、XL=${XL}Ω、XC=${XC}Ω、電源電圧V=${V}Vである。回路電流Iとして最も近いものはどれか。`,
    [correct,...wrong],correct,
    `合成リアクタンスは XL−XC=${XL-XC}Ω。\nZ=√{R²+(XL−XC)²}=${fmt(Z,2)}Ω。\nしたがって I=V/Z=${V}/${fmt(Z,2)}=${fmt(I,2)}A。`
  );
}

function genTransformer(){
  const sets=[
    {p:[25,20],pf:1,v1:6000},
    {p:[30,15],pf:.9,v1:6600},
    {p:[18,27],pf:.8,v1:6000},
    {p:[22,33],pf:.85,v1:6600},
    {p:[12,24,18],pf:.9,v1:6000}
  ];
  const s=sets[Math.floor(Math.random()*sets.length)];
  const P=s.p.reduce((a,b)=>a+b,0); // kW
  const S=P/s.pf; // kVA
  const I=S*1000/s.v1; // primary single-phase current
  const correct=`${fmt(I,2)} A`;
  const wrong=[
    `${fmt(P*1000/s.v1,2)} A`,
    `${fmt(S*1000/(Math.sqrt(3)*s.v1),2)} A`,
    `${fmt(P*1000/(Math.sqrt(3)*s.v1*s.pf),2)} A`,
    `${fmt(Math.sqrt(3)*S*1000/s.v1,2)} A`
  ];
  return q("tr-calc-"+Date.now()+"-"+Math.random(),"transformer",
    `変圧器の一次側は単相2線式 ${s.v1}V、二次側は三相3線式とする。二次側負荷の有効電力は ${s.p.join("kW、")}kW、各負荷の力率は ${s.pf} とし、損失を無視する。一次電流として最も近いものはどれか。`,
    [correct,...wrong],correct,
    `総有効電力 P=${P}kW。\n総皮相電力 S=P/cosφ=${fmt(S,2)}kVA。\n一次側は単相2線式なので I1=S×1000/V1=${fmt(I,2)}A。\n※一次側が三相なら √3 が入るため、結線・相数の確認が重要です。`
  );
}

function genShort(){
  const sets=[
    {V:6600,MVA:5,z:8},
    {V:6600,MVA:10,z:12},
    {V:3300,MVA:5,z:10},
    {V:6600,MVA:5,z:5},
    {V:22000,MVA:10,z:7.5}
  ];
  const s=sets[Math.floor(Math.random()*sets.length)];
  const In=s.MVA*1e6/(Math.sqrt(3)*s.V);
  const Is=In*100/s.z;
  const correct=`${fmt(Is/1000,2)} kA`;
  const wrong=[
    `${fmt(In/1000,2)} kA`,
    `${fmt((In*s.z/100)/1000,2)} kA`,
    `${fmt((s.MVA*1e6/s.V*100/s.z)/1000,2)} kA`,
    `${fmt((In*100/(s.z*2))/1000,2)} kA`
  ];
  return q("short-calc-"+Date.now()+"-"+Math.random(),"short",
    `三相 ${s.V.toLocaleString()}V 系統で、基準容量 ${s.MVA}MVA、想定短絡点から電源側を見た合成％インピーダンスが ${s.z}% である。三相短絡電流として最も近いものはどれか。`,
    [correct,...wrong],correct,
    `基準電流 In=Sn/(√3V)=${fmt(In,1)}A。\n短絡電流 Is=In×100/%Z=${fmt(Is,1)}A=${fmt(Is/1000,2)}kA。`
  );
}

function genTension(){
  const sets=[
    {w:1.2,L:50,f:1.5},
    {w:1.5,L:40,f:1.2},
    {w:1.0,L:60,f:2.0},
    {w:1.8,L:45,f:1.5},
    {w:2.0,L:50,f:2.5}
  ];
  const s=sets[Math.floor(Math.random()*sets.length)];
  // parabolic approximation H = w L^2 /(8 f), w N/m
  const H=s.w*s.L*s.L/(8*s.f);
  const correct=`${fmt(H,1)} N`;
  const wrongVals=[H*2,H/2,s.w*s.L*s.L/(4*s.f),s.w*s.L/(8*s.f)];
  const wrong=wrongVals.map(v=>`${fmt(v,1)} N`);
  return q("ten-calc-"+Date.now()+"-"+Math.random(),"tension",
    `径間L=${s.L}m、電線の単位長さ当たり荷重w=${s.w}N/m、弛度f=${s.f}mとする。放物線近似 H=wL²/(8f) を用いたとき、電線の水平張力Hとして最も近いものはどれか。`,
    [correct,...wrong],correct,
    `H=wL²/(8f) より、H=${s.w}×${s.L}²/(8×${s.f})=${fmt(H,1)}N。\n実際の最大張力問題では、温度・風圧・着氷雪など、問題文で指定された荷重条件を確認します。`
  );
}

const generators = {
  circuit: genRLC,
  transformer: genTransformer,
  short: genShort,
  tension: genTension
};

let state = {
  queue:[], index:0, answers:[], current:null, retrySource:null
};

function loadHistory(){
  try{return JSON.parse(localStorage.getItem(STORAGE_KEY))||{}}
  catch{return {}}
}
function saveHistory(h){localStorage.setItem(STORAGE_KEY,JSON.stringify(h))}
function recordHistory(id,correct){
  const h=loadHistory();
  h[id] ||= {shown:0,correct:0,wrong:0};
  h[id].shown++;
  if(correct) h[id].correct++; else h[id].wrong++;
  saveHistory(h);
}
function updateHomeStats(){
  const h=loadHistory();
  const vals=Object.values(h);
  const shown=vals.reduce((s,v)=>s+v.shown,0);
  const correct=vals.reduce((s,v)=>s+v.correct,0);
  $("homeStats").textContent = shown
    ? `累計 ${shown}問 / 正解 ${correct}問 / 正答率 ${Math.round(correct/shown*100)}%`
    : "まだ学習履歴はありません。";
}

function makePool(){
  const cat=$("category").value;
  const mode=$("mode").value;
  let pool=fixedQuestions.filter(x=>cat==="all"||x.category===cat);

  // 数値問題を十分な数だけ追加
  if($("numericVariant").checked){
    const cats=cat==="all" ? Object.keys(generators) : (generators[cat]?[cat]:[]);
    for(const c of cats){
      for(let i=0;i<8;i++) pool.push(generators[c]());
    }
  }

  const h=loadHistory();
  if(mode==="weak"){
    pool.sort((a,b)=>(h[b.id]?.wrong||0)-(h[a.id]?.wrong||0));
    const weak=pool.filter(x=>(h[x.id]?.wrong||0)>0);
    const rest=shuffle(pool.filter(x=>(h[x.id]?.wrong||0)===0));
    pool=[...weak,...rest];
  }else if(mode==="unseen"){
    const unseen=shuffle(pool.filter(x=>!(h[x.id]?.shown)));
    const seen=shuffle(pool.filter(x=>h[x.id]?.shown));
    pool=[...unseen,...seen];
  }else{
    pool=shuffle(pool);
  }
  return pool;
}

function startQuiz(customQuestions=null){
  let pool=customQuestions || makePool();
  const n=parseInt($("count").value,10);
  state.queue=pool.slice(0,Math.min(n,pool.length));
  if(!state.queue.length){alert("出題できる問題がありません。");return}
  state.index=0; state.answers=[];
  $("setup").classList.add("hidden");
  $("result").classList.add("hidden");
  $("quiz").classList.remove("hidden");
  renderQuestion();
}

function renderQuestion(){
  const item=state.queue[state.index];
  state.current=item;
  $("progress").textContent=`${state.index+1} / ${state.queue.length}`;
  $("progressFill").style.width=`${(state.index/state.queue.length)*100}%`;
  $("categoryBadge").textContent=categoryNames[item.category];
  $("question").textContent=item.text;
  $("questionNote").textContent=item.note||"";
  $("feedback").className="feedback hidden";
  $("feedback").textContent="";
  $("nextBtn").classList.add("hidden");

  let choices=item.choices.map(x=>({text:x,correct:x===item.answer}));
  if($("shuffleChoices").checked) choices=shuffle(choices);
  const box=$("choices"); box.innerHTML="";
  choices.forEach((c,i)=>{
    const b=document.createElement("button");
    b.className="choice";
    b.textContent=`${String.fromCharCode(65+i)}. ${c.text}`;
    b.onclick=()=>answer(c,b);
    box.appendChild(b);
  });
}

function answer(choice,button){
  const correct=choice.correct;
  [...$("choices").children].forEach(b=>b.disabled=true);
  if(correct) button.classList.add("correct");
  else{
    button.classList.add("wrong");
    [...$("choices").children].forEach(b=>{
      if(b.textContent.endsWith(state.current.answer)) b.classList.add("correct");
    });
  }

  recordHistory(state.current.id,correct);
  state.answers.push({question:state.current,correct,selected:choice.text});

  const f=$("feedback");
  f.className=`feedback ${correct?"ok":"ng"}`;
  f.textContent=`${correct?"正解":"不正解"}\n\n${state.current.explanation}`;
  $("nextBtn").classList.remove("hidden");
  $("nextBtn").textContent=state.index===state.queue.length-1?"結果を見る":"次の問題";
}

function next(){
  state.index++;
  if(state.index>=state.queue.length) showResult();
  else renderQuestion();
}

function showResult(){
  $("quiz").classList.add("hidden");
  $("result").classList.remove("hidden");
  const ok=state.answers.filter(x=>x.correct).length;
  const total=state.answers.length;
  $("score").textContent=`${ok} / ${total} 正解（${Math.round(ok/total*100)}%）`;
  const wrong=state.answers.filter(x=>!x.correct);
  $("resultSummary").textContent=wrong.length
    ? `間違えた ${wrong.length}問を下に表示します。`
    : "全問正解です。";

  const list=$("reviewList"); list.innerHTML="";
  wrong.forEach(x=>{
    const d=document.createElement("div");
    d.className="review-item";
    d.innerHTML=`<strong>${escapeHtml(x.question.text)}</strong>
      <div>あなたの回答：${escapeHtml(x.selected)}</div>
      <div>正解：${escapeHtml(x.question.answer)}</div>
      <div>${escapeHtml(x.question.explanation).replace(/\n/g,"<br>")}</div>`;
    list.appendChild(d);
  });
  state.retrySource=wrong.map(x=>x.question);
  $("retryWrongBtn").disabled=!wrong.length;
  updateHomeStats();
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
}
function backHome(){
  $("quiz").classList.add("hidden");
  $("result").classList.add("hidden");
  $("setup").classList.remove("hidden");
  updateHomeStats();
}

$("startBtn").onclick=()=>startQuiz();
$("nextBtn").onclick=next;
$("quitBtn").onclick=backHome;
$("backBtn").onclick=backHome;
$("retryWrongBtn").onclick=()=>{
  if(state.retrySource?.length) startQuiz(shuffle(state.retrySource));
};
$("resetHistoryBtn").onclick=()=>{
  if(confirm("学習履歴をすべて削除しますか？")){
    localStorage.removeItem(STORAGE_KEY); updateHomeStats();
  }
};
$("mode").onchange=()=>{
  $("category").disabled=$("mode").value!=="category" && false;
};
updateHomeStats();
