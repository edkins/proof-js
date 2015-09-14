module Main

import IQuery
import IQuery.Elements
import IQuery.Event
import Data.Fin
import Data.Vect

%default total

strToVec : (s : String) -> (n : Nat ** Vect n Char)
strToVec s = (length (unpack s) ** fromList (unpack s))

maxBoundMinus : Fin n -> Fin n
maxBoundMinus FZ = maxBound
maxBoundMinus (FS n) = weaken (maxBoundMinus n)

FinBoundMinus : Fin n -> Type
FinBoundMinus fn = Fin (finToNat (maxBoundMinus fn))

data Interval : Nat -> Type where
  MkInterval : {n : Nat} -> (start : Fin (S n)) -> FinBoundMinus start -> Interval n

start : Interval n -> Nat
start (MkInterval s _) = finToNat s

range : Interval n -> Nat
range (MkInterval start len) = finToNat len

FinSmaller : {n : Nat} -> {fn : Fin n} -> LTE (S (finToNat fn)) n
FinSmaller {n=Z} {fn} = void (FinZAbsurd fn)
FinSmaller {n=S n} {fn=FZ} = LTESucc LTEZero
FinSmaller {n=S n} {fn=FS fn} = LTESucc (FinSmaller {n} {fn})

remainder : Interval n -> Nat
remainder (MkInterval _ len) = finToNat (maxBoundMinus len)

subVect : Vect n a -> (r : Interval n) -> Vect (range r) a
subVect v (MkInterval start len) = take (finToNat len) (drop (finToNat start) v)
  
{-
data Expr (a : String) : Type where
  Invalid : Expr
  Num : Nat -> Expr
  Plus : Expr -> Expr -> Expr
  Mult : Expr -> Expr -> Expr

data Colour : Type where
  Black : Colour
  Red : Colour
  Blue : Colour

data Colouring (a : String) : Type where
  MkColouring : Vect (length a) Colour -> Colouring a

data Parser (a : Type) : Type where
  MkParser : (String -> Maybe (a, String, String) -> Parser a

(>>=) : Parser a -> (a -> Parser b) -> Parser b
MkParser m >>= f =


parse : (a : String) -> Colouring a
-}

change_cb : Event -> JS_IO Int
change_cb _ = do
  alert "changed"
  return 0

main : JS_IO ()
main = do
  nodes <- query "p"
  Just p <- elemAt nodes 0
  setProperty p "contentEditable" "true"
  onEvent KeyUp p change_cb
  onEvent Blur p change_cb
  --setText p "Hello?"
