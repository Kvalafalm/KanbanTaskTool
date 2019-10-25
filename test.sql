SELECT 
    stagehistory.idstage,
    COUNT('2019/10/23') AS expr1,
    '2019/10/23' AS date
FROM
    kanbantool.stagehistory
        INNER JOIN
    kanbantool.deskstages ON stagehistory.idstage = deskstages.idstages
WHERE
    stagehistory.start <= '2019/10/22'
        AND (stagehistory.end >= '2019/10/22'
        OR stagehistory.end IS NULL)
        AND deskstages.iddesk = 2
GROUP BY stagehistory.idstage
ORDER BY stagehistory.idstage