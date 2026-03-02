import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid ,  Label
} from "recharts";

const ScoreDistributionChart = ({ vendors }) => {

    const scoreRanges = [
    { name: "0-25", value: 0 },
    { name: "25-50", value: 0 },
    { name: "50-75", value: 0 },
    { name: "75-100", value: 0 },
    ];

    vendors.forEach((v) => {
    const score = v.reliability_score;

    if (score < 25) scoreRanges[0].value++;
    else if (score < 50) scoreRanges[1].value++;
    else if (score < 75) scoreRanges[2].value++;
    else scoreRanges[3].value++;
    });


  return (
    <ResponsiveContainer width="100%" height={300}>
    <BarChart data={scoreRanges} margin={{ top: 10, right: 30, left: 10, bottom: 25 }} >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
        dataKey="name"
        interval={0}
        angle={-20}
        textAnchor="end"
        height={60}
        >
            <Label value=" Reliability" position="bottom" offset={10} />
        </XAxis>

        <YAxis allowDecimals={false}>
            <Label
                value="Number of Suppliers"
                angle={-90}
                position="insideLeft"
                style={{ textAnchor: 'middle' }}
            />
        </YAxis>
        <Tooltip />
        <Bar dataKey="value" fill="#1976d2" barSize={40}/>
    </BarChart>
    </ResponsiveContainer>
  );
};

export default ScoreDistributionChart;
