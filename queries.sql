/*
1. Leitura ProductsBB
2. Leitura InventoryBB
3. Append Produtos novos em AmzProducts
4. Zera flag exportacao AmzProducts
5. Update precos altarados em AmzProducts , marca exportar
6. Update stock em AmzProducts se [InventoryBB].[quantity]<>[AmzProducts].[stock], marca exportar
7. CreateTable AmzUpdt com AmzProducts where exportar=sim
8. Calcula precoAmz do AmzUpdt
9. Gera flatfile para Upload na Amazon
*/


# get the products that need to be zeroed
# testing this thing!

# took 192 secs to run
#drop table bigbuy.amazon_set_to_zero
create table bigbuy.amazon_set_to_zero as

select a.sku, 0 as quantity
from amazon as a
where a.sku not in (select sku from inventory);


# create the new table to upload with updated quantities

drop table bigbuy.amazon_new
create table bigbuy.amazon_new as
select p.sku, p.ean13, p.inShopsPrice, i.quantity
from products as p inner join inventory as i on (i.bigbuy_id = p.bigbuy_id)
where i.quantity > 0 and p.ean13 <> 0
