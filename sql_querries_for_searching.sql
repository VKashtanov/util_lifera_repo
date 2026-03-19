-- if ONE WORD is entered for searching

SELECT userId 
FROM User_ 
WHERE companyId = 20097 
  AND status = 0 
  AND (
    LOWER(firstName) LIKE 'кашт%' OR 
    LOWER(lastName) LIKE 'кашт%' OR 
    LOWER(emailAddress) LIKE 'кашт%'
  )
ORDER BY lastName, firstName 
LIMIT 10 OFFSET 0;



-- if TWO WORD is entered for searching
SELECT userId 
FROM User_ 
WHERE companyId = 20097 
  AND status = 0 
  AND (
    (LOWER(firstName) = 'кашт' AND LOWER(lastName) LIKE 'кашт%')  OR 
    (LOWER(lastName)  = 'кашт'AND LOWER(firstName) LIKE 'кашт%')  OR 
    (LOWER(firstName) = 'кашт' AND LOWER(middleName) LIKE 'кашт%')
  )
ORDER BY lastName, firstName 
LIMIT 10 OFFSET 0;



-- if THREE WORD is entered for searchingSELECT userId 
SELECT userId 
FROM User_ 
WHERE companyId = 20097 
  AND status = 0 
  AND (
    (LOWER(firstName) = 'иван' AND LOWER(middleName) = 'петрович' AND LOWER(lastName)   LIKE 'сидоров%') OR
    (LOWER(lastName) =  'иван' AND LOWER(firstName) =  'петрович' AND LOWER(middleName) LIKE 'сидоров%')
  )
ORDER BY lastName, firstName 
LIMIT 10 OFFSET 0;