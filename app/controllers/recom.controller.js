const db = require("../models");
const Movies = db.movie;
const Genres = db.genre;
const Op = db.Sequelize.Op;

exports.findRecom = (req, res) => {
    const genre = req.params.gen;
    const fav = req.params.fav;
    const comm = req.params.comm;
    const imdb = req.params.imdb;
    const meta = req.params.meta;
    const pop = req.params.pop;
    Movies.sequelize.query(`SELECT Movies.Id, NameMovie, Favorite, CommunityGrade, IMDBGrade, MetaScoreGrade, Popularity 
    FROM Movies INNER JOIN Genres ON Movies.IdGenre = Genres.Id AND Genres.Genre_Name = \'${genre}\';`)
    .then(([data, metadata]) => {
        if(data){
            var i = 0;
            var favorite;
            var n = data.length;
            var grade = 0;
            var values;
            var recommended = [];
            
            while (i < n) 
            {
                values = Object.values(data[i]);
                favorite = values[2] ? 100 : 0;
                grade = favorite * (fav / 100.0)
                        + values[3] * (comm / 100.0) * 10
                        + values[4] * (imdb / 100.0) * 10
                        + values[5] * (meta / 100.0) * 10
                        + values[6] * (pop / 100.0);
                values.push(grade);
                
                if (recommended.length == 0)
                {
                    recommended.push(values);
                }
                else if (values[7] <= recommended[recommended.length - 1][7] 
                        && recommended.length < 10)
                {
                    recommended.push(values)
                }
                else
                {
                    
                    var j = 0;
                    var m = recommended.length;
                    while (j < m)
                    {
                        if (values[7] > recommended[j][7])
                        {
                            recommended.splice(j, 0, values);
                            if (recommended.length == 10)
                            {
                                recommended.pop();
                            }
                            break;
                        }
                        j++;
                    }
                }
                i++;
            }
            var grade_category;
            let json_list = []
            for (i = 0; i < recommended.length; i++) 
            {
                if (recommended[i][7] <= 40) 
                {
                    grade_category = "Bajo";
                }
                else if (recommended[i][7] >= 80)
                {
                    grade_category = "Alto";
                }
                else 
                {
                    grade_category = "Medio";
                }
                json_list.push({"Id": recommended[i][0], "NameMovie": recommended[i][1], "MetaScoreGrade": grade_category});
            }
            res.send(json_list);
        } else {
        res.status(404).send(
            {
            message: "Resource not found"
            })
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).send({
            message: "Error retrieving all movies"
        });
    });
}