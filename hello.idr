module Main

-- Stolen from IQuery (but fixed)

data Element : Type where
  MkElem : Ptr -> Element

data NodeList : Type where
  MkNodeList : Ptr -> NodeList

%inline
jscall : (fname : String) -> (ty : Type) ->
          {auto fty : FTy FFI_JS [] ty} -> ty
jscall fname ty = foreign FFI_JS fname ty

nl_length : NodeList -> JS_IO Int
nl_length (MkNodeList l) =
  jscall "%0.length" (Ptr -> JS_IO Int) l

elemAt : NodeList -> Int -> JS_IO (Maybe Element)
elemAt (MkNodeList l) i = do
  if !(nl_length $ MkNodeList l) > i then do
    ptr <- jscall "%0.item(%1)" (Ptr -> Int -> JS_IO Ptr) l i
    return (Just $ MkElem ptr)
  else
    return Nothing

query : String -> JS_IO NodeList
query q = do
  ptr <- jscall "document.querySelectorAll(%0)" (String -> JS_IO Ptr) q
  return (MkNodeList ptr)

setText : Element -> String -> JS_IO ()
setText (MkElem e) s =
  jscall "%0.textContent=%1" (Ptr -> String -> JS_IO ()) e s

main : JS_IO ()
main = do
  nodes <- query "p"
  Just p <- elemAt nodes 1
  setText p "Hello?"
